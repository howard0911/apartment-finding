# Apartment Hunting Assistant — Web

React + Vite + TypeScript prototype with a card-by-card survey and Tinder-style swipe results.

## Workflow in the app
- Cold survey: card-by-card experience in `src/App.tsx` + `src/components/QuestionCard.tsx`; one question per page.
- Personalized search: `performAISearch` in `src/services/AISearchService.ts` scores sample listings using the survey (price, commute mode/time, must-have/avoid, extra priorities).
- Results deck: `SwipeDeck` shows a Tinder-like Like/Skip controller; also lists all matches with priority score, lease/utilities, move-in, and neighborhood note. Results only appear after completing the survey.
- Details modal: `ApartmentDetail` renders a map embed (Google Maps URL), amenities, commute preview, risk flags, official listing link, room-tour/guide videos, and Groq-style review pros/cons plus a personalized note.
- Mock data/services: sample listings + reviews + videos live entirely in the frontend. Groq is simulated (`src/services/ReviewService.ts`)—swap in a real API + server proxy for production.

## Files to know
- `src/App.tsx`: Page layout, survey card flow → search, swipe deck + detail modal.
- `src/components/QuestionCard.tsx`: Card wrapper for each survey question.
- `src/components/SwipeDeck.tsx`: Tinder-style like/skip controller using the ranked results.
- `src/components/ApartmentRow.tsx`, `src/components/ApartmentDetail.tsx`: Result cards and detail view with map, videos, reviews.
- `src/models/Apartment.ts`, `src/models/UserPreferences.ts`: Types plus sample data/preferences.
- `src/services/AISearchService.ts`, `src/services/VideoService.ts`, `src/services/ReviewService.ts`: Mock scoring, video search, and Groq review summarization.
- `src/styles.css`: Lightweight styling for the two-column layout, pills, chips, and modal.

## Running locally

```bash
cd /Users/howardpeng/Documents/Project/apartment_hunting_assistant
npm install
npm run dev
# open http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview
```

## Limitations and TODOs
- Listings, videos, and reviews are mocked; map uses a simple Google Maps embed. Swap `services/*` with real APIs + a backend proxy (required for Groq keys).
- Commute and neighborhood risk data are placeholders; integrate real geodata to replace heuristics.
- No tests/CI yet. Add basic component tests and a GitHub Actions build once APIs are wired.
