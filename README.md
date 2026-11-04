# AniWorld

Track the anime you watch and the manga you read: browse seasons and rankings, read manga chapters,
keep a personal list and leave reviews.

The backend lives in [AniWorldAPI](https://github.com/cesardecasas/AniWorldAPI).

## Technologies

* Next.js 16 and React 19, TypeScript
* App Router with Tailwind CSS and TanStack Query for new pages; the original pages router UI is being rebuilt there
* Jest for unit tests, Playwright for end-to-end tests
* Hosted on Netlify, with an edge function that blocks scrapers and bad bots

## Data sources

* [AniList](https://docs.anilist.co/) — anime details, seasons and rankings
* [Jikan](https://docs.api.jikan.moe/) — optional extras (theme songs, episode titles) when its public instance is up
* [MangaDex](https://api.mangadex.org/docs/) — manga and chapters
* [Animechan](https://animechan.io/) — quotes
* [AniWorldAPI](https://github.com/cesardecasas/AniWorldAPI) — accounts, lists, reviews and reading progress

## How sign-in works

The browser never talks to AniWorldAPI directly. This app's `/api/v1/*` routes forward requests to it and keep the
login token in an httpOnly, SameSite=Lax cookie, so page scripts can't read it. Writes are only accepted from this
site (CSRF check), and the visitor's IP is passed on so the API's rate limits apply per person.

## Running locally

```bash
cd client
npm install
cp .env.example .env.local   # point API_URL at a running AniWorldAPI
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm test` | Jest unit tests |
| `npm run test:e2e` | Playwright tests on desktop and mobile (starts the dev server; sign-in tests need the API) |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript |

The Dark Fantasy design tokens can be previewed at `/design` in development.

## Deploying (Netlify)

Set these environment variables on the site:

| Variable | Value |
| --- | --- |
| `API_URL` | The AniWorldAPI URL, e.g. `https://aniworld-api.onrender.com` |
| `API_PROXY_SECRET` | Same value as the API's `API_PROXY_SECRET` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional: enables the Cloudflare Turnstile challenge on sign-up, sign-in and reviews |
