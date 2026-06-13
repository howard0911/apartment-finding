# Project Roadmap — Apartment Hunting Assistant (Web)

> An apartment-hunting assistant: collect user preferences through a survey, then
> surface and score listings enriched with commute times, neighborhood safety,
> review summaries, and video tours.
>
> Stack: **Vite + React 18 + TypeScript** (frontend) and **Express + TypeScript**
> (backend API gateway). Migrated from the original SwiftUI iOS app.

---

## Phase 0 — Current State ✅ (scaffold complete)

What already exists today.

- **Frontend UX flow**: `intro → survey → results` state machine (`src/App.tsx`).
  - Multi-step preference survey via `QuestionCard` (budget, location, commute,
    must-haves / avoids).
  - Results browsing via `SwipeDeck` (like / skip), `ApartmentRow`,
    `ApartmentDetail`, and a Mapbox `MapView`.
  - Light/dark theme toggle, geolocation, Google geocoding.
- **Backend pipeline**: `POST /api/search` enrichment chain
  (`backend/src/routes/search.ts`): listings → commute → safety → video →
  reviews → scoring.
- **Git**: clean history on `main`, secrets ignored (`.env`, `node_modules`, `dist`).

### Known gaps (the two things blocking a usable product)

1. **Frontend and backend are not connected.** `App.runSearch` calls the
   frontend's own `performAISearch` (`src/services/AISearchService.ts`) against
   local `sampleData` — it never hits the backend `/api/search`. The backend is
   built but orphaned.
2. **Data is mostly mock.** `listingService` returns 2 hard-coded listings;
   `safetyService` and `reviewService` return mock strings. Real integrations
   (Google commute, YouTube video) exist but are gated on API keys.

---

## Phase 1 — Connect frontend ↔ backend, secure keys 🎯 (highest priority)

Goal: one real data path, secrets server-side only.

- [ ] Point the frontend search at the backend: replace `performAISearch` with a
      `fetch('/api/search', …)` call returning scored `Apartment[]`.
- [ ] Add a Vite dev proxy (`vite.config.ts`) so `/api` routes to
      `http://localhost:4000` in development.
- [ ] Move all third-party keys (Google, Groq/OpenAI, YouTube) server-side; remove
      `VITE_*` API keys from the browser bundle. Keep only truly public tokens
      (e.g. a domain-restricted Mapbox token) on the client.
- [ ] Delete or thin the duplicated frontend services
      (`src/services/CommuteService.ts`, `ReviewService.ts`, etc.) once the backend
      owns enrichment, to remove the parallel implementation.

**Done when:** a survey submission returns scored results from the backend, and no
secret keys appear in the built JS.

---

## Phase 2 — Real listing data

Goal: replace mock listings with a live source.

- [ ] Implement `getBaseListings` against a real feed or DB
      (`backend/src/services/listingService.ts` — currently TODO: Zillow /
      Apartment List / DB).
- [ ] Persist listings + normalize the `Apartment` shape across front/back
      (`src/models/Apartment.ts` ↔ `backend/src/types/index.ts`).
- [ ] Handle pagination and the empty-results state in the UI.

---

## Phase 3 — Real enrichment & scoring

Goal: turn mock enrichment into trustworthy signals.

- [ ] Safety: replace mock `safetyService` with real crime/neighborhood data.
- [ ] Reviews: wire `reviewService` to Google Places / Yelp, then summarize with
      Groq/OpenAI (the summarization path already exists).
- [ ] Verify commute (`commuteService`) and video (`videoService`) against real
      keys end-to-end.
- [ ] Tune `scoringService` weights and surface a per-apartment score breakdown in
      `ApartmentDetail`.

---

## Phase 4 — Persistence, polish, deploy

- [ ] Persist liked/skipped apartments (currently in React state only).
- [ ] Loading / error / empty states across the flow; basic input validation.
- [ ] Flesh out `README.md` (currently a single line): setup, env vars, run steps.
- [ ] Add a smoke/e2e test for the `/api/search` happy path.
- [ ] Deploy (frontend static host + backend service) and set a remote.

---

## Phase 5 — Stretch

- [ ] Natural-language search (the "AI" in AISearchService) — parse free-text
      queries into structured `UserPreferences`.
- [ ] User accounts + saved searches.
- [ ] Notifications for new matching listings.

---

## Suggested order

`Phase 1` first — it unblocks everything and fixes the key-exposure issue with the
smallest change. Then `Phase 2` (real data) makes the app genuinely useful, and
`Phase 3` makes the rankings trustworthy.
