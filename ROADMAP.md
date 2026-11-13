# Roadmap — Apartment Hunting Assistant (Web)

> Collect user preferences through a survey, then surface and score real listings
> enriched with commute times. Stack: **Vite + React 18 + TypeScript** (frontend)
> and **Express + TypeScript** (backend API gateway).

**Goal:** a testable MVP in ~8 weeks (estimated at 3 working days/week, ~24 days total).

**MVP scope:** one city, real listings, real commute times, a ranking users can trust,
deployed at a public URL. Out of scope: safety scores, review summaries, accounts.

---

## Current state (2026-11-13)

| Area | Status | Notes |
| --- | --- | --- |
| Frontend flow (survey → swipe → detail) | Works | 8-step survey, Like/Skip, detail modal, light/dark theme |
| UI design | Improved | Design review fixed 11 issues (C+ → B); swipe card still has no photo |
| Backend `/api/search` | Wired | Frontend calls it through the Vite `/api` proxy; filtering and ranking live in `scoringService` |
| Listings | Mock | `listingService` returns 4 hard-coded listings |
| Safety / reviews | Partly mock | Safety removed; Groq (`openai/gpt-oss-20b`) summarizes reviews on detail open, but the reviews themselves are 2 hard-coded strings |
| Commute / video | Commute works | Routes API `computeRouteMatrix`, cached in memory; videos fetched on detail open, but `YOUTUBE_API_KEY` is disabled until real listings |
| API keys | Server-side | Only the public `VITE_MAPBOX_TOKEN` is read in the browser; no secret in built JS |
| Type check | Clean | Frontend and backend share `backend/src/types/index.ts`; `tsc` passes in both |
| Tests / deploy | None | No tests, no git remote, one-line README |

---

## Phase 1 — Connect frontend ↔ backend (weeks 1–2)

- [x] Point frontend search at `fetch('/api/search', …)`; add a Vite dev proxy to `http://localhost:4000` (1d)
- [x] Move all third-party keys server-side; remove secret `VITE_*` keys from the bundle (1d)
- [x] Unify the `Apartment` type across `src/models/Apartment.ts` and `backend/src/types/index.ts`; fix the 10 `tsc` errors (1.5d)
- [x] Delete the duplicated frontend services (`CommuteService.ts`, `ReviewService.ts`, …) (0.5d)

**Gate:** survey results come from the backend, and no secret key appears in built JS.

## Phase 2 — Real listings (weeks 3–5)

- [ ] Pick a listing source and implement `getBaseListings` in `backend/src/services/listingService.ts` (5d)
- [ ] Persist listings in a database, with pagination (3d)
- [ ] Swipe card shows a photo and an emphasized price (1d)

**Gate:** 50+ real listings in one city, each with a photo and price.

## Phase 3 — Trustworthy ranking (week 6)

- [ ] Verify `commuteService` end-to-end with real keys (1d)
- [ ] Tune `scoringService` weights; show a per-apartment score breakdown in `ApartmentDetail` (2d)
- [ ] Hide empty map/video blocks in the detail view; remove mock review text (0.5d)

## Phase 4 — Test and launch (weeks 7–8)

- [ ] Persist liked apartments in `localStorage` (0.5d)
- [ ] Visible labels on inputs; error and empty states (1d)
- [ ] End-to-end test for the `/api/search` happy path (1d)
- [ ] Deploy frontend + backend, add a git remote, write the README (2d)
- [ ] Usability test with 5 people, then fix what they hit (3d)

**Gate (MVP done):**
1. Results come from `/api/search`, not frontend mock data.
2. 50+ real listings in at least one city, each with photo and price.
3. No secret keys in built JS.
4. Liked listings survive a page reload.
5. `tsc` has zero errors and the `/api/search` e2e test passes.
6. All 5 testers get from survey to a listing they want to see in under 3 minutes.

## Phase 5 — After MVP

- [ ] Real safety data (crime / neighborhood)
- [ ] Review summaries from Google Places / Yelp
- [ ] Natural-language search → structured `UserPreferences`
- [ ] Accounts, saved searches, new-listing notifications

---

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Zillow-class APIs are closed to individuals or forbid scraping | No real listings; MVP stalls | Survey sources in week 1; fallback = paid listing API or one city with manual import (decide by end of week 3) |
| Google commute / LLM costs scale with usage | Bills spike during testing | Cache commute results server-side; set daily quotas |
| Keys already exposed in the browser bundle | Abuse, unexpected charges | After Phase 1, rotate every key |
| Scores look arbitrary (test listing scores 20) | Users distrust the ranking | Show score breakdown; tune weights from tester Like/Skip |
| One part-time developer | Schedule slips | Hold MVP scope; defer all of Phase 5 |

## Open questions

- [ ] Which city goes first?
- [ ] Listing source: paid API, broker partnership, or manual import?
- [ ] Monthly API budget cap?
- [ ] Actual days per week available? (8 weeks assumes 3)
- [ ] Side project or paid product? Paid pulls accounts/payments into the MVP.
- [ ] Hosting: Vercel/Netlify for frontend, Render/Fly.io/Railway for backend?
