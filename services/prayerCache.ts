import { PrayerResponse, GroundingSource, Religion } from '../types';

interface CacheEntry {
  prayers: PrayerResponse[];
  sources: GroundingSource[];
  timestamp: number;
}

interface CacheData {
  entries: Record<string, CacheEntry>;
  accessOrder: string[]; // For LRU eviction
}

const CACHE_KEY = 'soulsolace_prayer_cache';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ENTRIES = 50;

/**
 * Normalize situation text for consistent cache keys
 */
const normalizeSituation = (situation: string): string => {
  return situation
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
};

/**
 * Generate cache key from religion and situation
 */
const getCacheKey = (religion: Religion, situation: string): string => {
  return `${religion}::${normalizeSituation(situation)}`;
};

/**
 * Load cache from localStorage
 */
const loadCache = (): CacheData => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load prayer cache:', error);
  }
  return { entries: {}, accessOrder: [] };
};

/**
 * Save cache to localStorage
 */
const saveCache = (cache: CacheData): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save prayer cache:', error);
    // If storage is full, clear old entries and try again
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      evictOldestEntries(cache, 10);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {
        // Give up if still failing
      }
    }
  }
};

/**
 * Evict oldest entries from cache
 */
const evictOldestEntries = (cache: CacheData, count: number): void => {
  const toRemove = cache.accessOrder.slice(0, count);
  toRemove.forEach(key => {
    delete cache.entries[key];
  });
  cache.accessOrder = cache.accessOrder.slice(count);
};

/**
 * Check if a cache entry is still valid (not expired)
 */
const isEntryValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < TTL_MS;
};

/**
 * Get cached prayer result
 */
export const getCachedPrayer = (
  religion: Religion,
  situation: string
): { prayers: PrayerResponse[]; sources: GroundingSource[] } | null => {
  const cache = loadCache();
  const key = getCacheKey(religion, situation);
  const entry = cache.entries[key];

  if (entry && isEntryValid(entry)) {
    // Update access order (move to end for LRU)
    cache.accessOrder = cache.accessOrder.filter(k => k !== key);
    cache.accessOrder.push(key);
    saveCache(cache);

    return {
      prayers: entry.prayers,
      sources: entry.sources
    };
  }

  // Remove expired entry if exists
  if (entry) {
    delete cache.entries[key];
    cache.accessOrder = cache.accessOrder.filter(k => k !== key);
    saveCache(cache);
  }

  return null;
};

/**
 * Cache a prayer result
 */
export const cachePrayer = (
  religion: Religion,
  situation: string,
  prayers: PrayerResponse[],
  sources: GroundingSource[]
): void => {
  const cache = loadCache();
  const key = getCacheKey(religion, situation);

  // Evict oldest entries if at capacity
  if (cache.accessOrder.length >= MAX_ENTRIES && !cache.entries[key]) {
    evictOldestEntries(cache, cache.accessOrder.length - MAX_ENTRIES + 1);
  }

  // Remove from access order if updating existing
  cache.accessOrder = cache.accessOrder.filter(k => k !== key);

  // Add new entry
  cache.entries[key] = {
    prayers,
    sources,
    timestamp: Date.now()
  };
  cache.accessOrder.push(key);

  saveCache(cache);
};

/**
 * Clear the entire cache
 */
export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { entryCount: number; oldestEntryAge: number | null } => {
  const cache = loadCache();
  const entries = Object.values(cache.entries);

  if (entries.length === 0) {
    return { entryCount: 0, oldestEntryAge: null };
  }

  const oldestTimestamp = Math.min(...entries.map(e => e.timestamp));
  return {
    entryCount: entries.length,
    oldestEntryAge: Date.now() - oldestTimestamp
  };
};
