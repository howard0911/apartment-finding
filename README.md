# Apartment Hunting Assistant

Answer a short survey, then swipe through apartments ranked for you, with commute times, a map, and an AI-written pros/cons summary.

**Live:** https://apartment-hunting-assistant.vercel.app

**Stack:** Vite + React 18 + TypeScript (frontend), Express + TypeScript (backend API), deployed on Vercel (the backend runs as a serverless function in `api/index.ts`).

## Status

The app works end to end, but **listings are still mock data** (4 hard-coded San Francisco listings in `backend/src/services/listingService.ts`). Everything built on them is real: filtering, ranking, commute times, map and review summaries. See `ROADMAP.md` for the plan.

Development is paused at the start of Phase 2. The chosen listing source is the RentCast API (free plan: 50 requests/month), fetched once into a JSON snapshot so no request is made at runtime. Scraping Zillow or Apartments.com was rejected: it breaks their terms and Vercel IPs get blocked.

## How it works

1. **Survey** (`src/App.tsx`, `src/components/QuestionCard.tsx`): 8 cards, one question each.
2. **Search**: the frontend calls `POST /api/search` (`src/services/api.ts`). The backend loads listings, adds commute times, then filters and ranks them (`scoringService`).
3. **Swipe deck** (`SwipeDeck`): Like/Skip over the ranked results.
4. **Detail modal** (`ApartmentDetail`): Mapbox map, amenities, commute, risk flags, and two lazily loaded blocks:
   - `GET /api/apartments/:id/videos` (YouTube; returns an empty list when no key is set)
   - `POST /api/apartments/:id/review-summary` (Groq, JSON mode, cached in memory)

## Backend services (`backend/src/services`)

| File | Role |
| --- | --- |
| `listingService.ts` | Listing source (mock for now) |
| `commuteService.ts` | Google Routes API `computeRouteMatrix`, cached in memory to save quota |
| `scoringService.ts` | Filters, deal-breakers and priority scoring |
| `reviewService.ts` | Groq review summary with strict validation |
| `videoService.ts` | YouTube Data API lookup per apartment |
| `http.ts` | Shared retry helper |

The API types live in `backend/src/types/index.ts` and are shared with the frontend through `import type`, so that file must stay type-only.

## Running locally

```bash
npm install
npm install --prefix backend
cp backend/.env.example backend/.env   # then fill in the keys
```

Create a root `.env` for the browser-side Mapbox token:

```
VITE_MAPBOX_TOKEN=pk....
```

Run the backend and the frontend in two terminals:

```bash
npm run dev --prefix backend   # API on http://localhost:4000
npm run dev                    # app on http://localhost:5173 (proxies /api to :4000)
```

Production build and type check:

```bash
npm run build
npx tsc --noEmit
```

## Environment variables

| Variable | Where | Needed for |
| --- | --- | --- |
| `GOOGLE_API_KEY` | `backend/.env`, Vercel | Commute times (Routes API) |
| `GROQ_API_KEY` | `backend/.env`, Vercel | Review summaries |
| `YOUTUBE_API_KEY` | `backend/.env` | Videos. Optional; enable YouTube Data API v3 for the key first |
| `VITE_MAPBOX_TOKEN` | root `.env`, Vercel | Detail map. Public token, shipped to the browser |

All other keys stay server-side and never reach the built JS. `.env` files are git-ignored.

## Deploying

`vercel.json` serves the Vite build and rewrites `/api/*` to the serverless function. Set the three variables above in the Vercel project, then deploy. `api/tsconfig.json` makes the function compile as CommonJS; without it the function crashes at startup on ESM imports.

Per-deployment URLs sit behind Vercel Authentication; use the main production domain.

## Known limitations

- Mock listings (see Status).
- `/api/search` requires every array in `preferences` (`mustHaveFeatures`, `dealBreakers`, `additionalPoints`, ...); a missing one returns 500.
- The reviews fed to Groq are hard-coded, so the Groq summary only summarizes those.
- No tests and no CI yet.
