# SoulSolace

AI-powered prayer assistant that retrieves authentic scriptural prayers from various religious traditions using Google's Gemini API with grounded search.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (CDN) + custom CSS
- **AI**: Google Gemini 2.0 Flash with Google Search grounding
- **Analytics**: PostHog
- **Deployment**: Vercel (static site)

## Project Structure

```
/
├── App.tsx              # Main app component, state management
├── index.tsx            # Entry point
├── index.css            # Custom CSS (no @apply - using Tailwind CDN)
├── index.html           # HTML template with Tailwind config
├── types.ts             # TypeScript interfaces and enums
├── constants.ts         # Religion options configuration
├── components/
│   ├── ReligionCard.tsx # Religion selection cards with ripple effects
│   ├── PrayerDisplay.tsx # Prayer results with tabs
│   └── Icon.tsx         # Lucide icon wrapper
├── services/
│   ├── geminiService.ts # Gemini API integration
│   ├── prayerCache.ts   # LocalStorage cache (24hr TTL, 50 entries LRU)
│   ├── retry.ts         # Exponential backoff retry logic
│   └── analytics/       # PostHog tracking
├── hooks/
│   └── useDebounce.ts   # Debounce and abort controller hooks
└── vite.config.ts       # Vite config with env vars
```

## Key Concepts

### App States
- `SELECTION`: Choose religion tradition
- `INPUT`: Enter prayer intention/situation
- `LOADING`: API call in progress with progressive phases
- `RESULT`: Display 3 prayers with tabs

### Loading Phases
1. `searching` - "Searching scriptural records..."
2. `generating` - "Finding authentic prayers..."
3. `finalizing` - "Verifying theological sources..."

### Prayer Response Schema
```typescript
{
  title: string;          // Prayer name
  prayerBody: string;     // Full text
  explanation: string;    // Source context
  isCanonical: boolean;   // True if verbatim scripture
  origin: string;         // Religious text source
}
```

## Environment Variables

```env
GEMINI_API_KEY=your_api_key_here
```

The Vite config exposes this as `process.env.API_KEY` for browser use.

## Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

## Important Notes

### CSS Styling
- Uses Tailwind CDN (no build step)
- **Do NOT use `@apply` directives** - they require PostCSS
- Custom classes in `index.css` use regular CSS
- Animations defined in both index.html (Tailwind config) and index.css

### Caching
- Prayers cached in localStorage with key `soulsolace_prayer_cache`
- 24-hour TTL, max 50 entries with LRU eviction
- Cache key format: `${religion}::${normalizedSituation}`

### API Model
- Using `gemini-2.0-flash` for cost efficiency (~$3/month vs ~$52/month for Pro)
- Google Search grounding enabled for authentic prayer retrieval
- JSON schema response with exactly 3 prayers

### Base URL
- Deployed at `/soulsolace/` path
- Configured in `vite.config.ts` with `base: '/soulsolace/'`

## Design System

### Colors
- Primary: Amber/Orange (`#f59e0b`, `#d97706`)
- Accent: Indigo/Purple (`#6366f1`, `#8b5cf6`)
- Background: Animated gradient orbs (amber, indigo, emerald)

### Effects
- Glass cards with backdrop blur
- Ripple effect on card clicks
- Hover shine animations
- Progressive loading with concentric rings

## Deployment

Pushes to `main` branch auto-deploy to Vercel.

Live URL: https://dbtech45.com/soulsolace/
