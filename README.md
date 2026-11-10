# Prisma frontend v2

React 19 · Vite · MUI · RTK Query · JavaScript

> v1 (built without AI) lives on the `legacy` branch.

## Run locally

1. Start the backend (`prisma-v2/backend`, see its README) on `:8080`.
2. `npm install`
3. `npm run dev` → http://localhost:5173

In development Vite proxies `/api` to the backend, so the session cookie and
the `XSRF-TOKEN` cookie behave as if front and back shared one origin.
The "Continuar con Google" button goes straight to the backend
(`VITE_BACKEND_URL`, default `http://localhost:8080`).

## Scripts

- `npm run build` — production build
- `npm test` — unit tests (Vitest)
- `npm run lint` — ESLint

## Structure

Folders by business module, mirroring the backend:

- `src/app/` — store, theme, routes, shared RTK Query `baseApi`/`baseQuery`
- `src/users/` — sign-in, session (`getMe`, `logout`), route guard
- `src/layout/` — app shell (drawer, top bar, logo)
- `src/home/` — temporary landing page

Rules: server state only in RTK Query (never copied to slices), the JWT is
never read by JavaScript, user-facing text in Spanish, code in English.
See `prisma-v2/CLAUDE.md` for all agreements.
