const CACHE_NAME = 'soulsolace-v1';
const PRAYER_CACHE_NAME = 'soulsolace-prayers-v1';
const MAX_PRAYER_CACHE_ENTRIES = 10;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/assets/bg.png',
  '/assets/hero.png',
  '/manifest.json'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache static assets, ignore failures for external resources
      return Promise.allSettled([
        ...STATIC_ASSETS.map(url => cache.add(url).catch(() => console.log('Failed to cache:', url))),
        ...EXTERNAL_ASSETS.map(url => cache.add(url).catch(() => console.log('Failed to cache external:', url)))
      ]);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== PRAYER_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Helper to limit prayer cache entries
async function limitPrayerCache() {
  const cache = await caches.open(PRAYER_CACHE_NAME);
  const keys = await cache.keys();

  if (keys.length > MAX_PRAYER_CACHE_ENTRIES) {
    // Remove oldest entries (first in the list)
    const toDelete = keys.slice(0, keys.length - MAX_PRAYER_CACHE_ENTRIES);
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}

// Fetch event - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API calls (Gemini API or similar) - network first, fallback to cache
  if (url.hostname.includes('generativelanguage.googleapis.com') ||
      url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          // Clone response before caching
          if (response.ok) {
            const responseClone = response.clone();
            const cache = await caches.open(PRAYER_CACHE_NAME);
            await cache.put(event.request, responseClone);
            await limitPrayerCache();
          }
          return response;
        })
        .catch(async () => {
          // Try to get from cache when offline
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline response for API calls
          return new Response(
            JSON.stringify({
              error: 'offline',
              message: 'You are offline. Please check your connection.'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle navigation requests - network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Return cached index.html for offline navigation
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For static assets - cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        event.waitUntil(
          fetch(event.request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, response);
                });
              }
            })
            .catch(() => {}) // Ignore network errors for background updates
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline fallback for images
          if (event.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f3f4f6" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="12">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
