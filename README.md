# MutualTrack

Next.js frontend for tracking Indian mutual fund investments — portfolio dashboard, fund research, CAMS upload, and auth.

> **Note:** This project is a **precursor / prototype** of the real MutualTrack application, which will be developed later. The local [`mock-api/`](mock-api/) backend is intentionally fake (in-memory) so the UI and flows can be built and demoed ahead of the production services.

For local development it talks to a **fake dual-port API** in [`mock-api/`](mock-api/) (auth on `:8081`, investments/funds on `:8888`).

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Axios, React Hook Form, Zod, Recharts, TanStack Table

## Features

- Register / sign in / sign out with session persisted in `localStorage`
- Protected routes (`/dashboard`, `/portfolio/...`); guest-only `/login` and `/register`
- Portfolio dashboard: totals, category/AMC charts, holdings table
- Category **allocation targets** with actual-vs-target drift (±2 pp on-target band)
- Add investments manually or upload a CAMS report (mocked parse)
- Fund search (Research) and performance charts by period
- Scheme detail pages (NAV, AUM, returns, history)

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Frontend
npm install

# Mock API (first time)
npm --prefix mock-api install
```

## Run locally

Two terminals:

```bash
# Terminal 1 — fake backend (:8081 auth, :8888 investments)
npm run mock-api

# Terminal 2 — Next.js app
npm run dev
```

Or together (macOS / Linux):

```bash
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Email | Password | Notes |
|-------|----------|--------|
| `demo@mutualtrack.com` | `password123` | Rich portfolio (~11 holdings) |
| `empty@mutualtrack.com` | `password123` | Empty portfolio (add / CAMS flows) |
| `active@mutualtrack.com` | `password123` | Smaller portfolio |

More API detail: [`mock-api/README.md`](mock-api/README.md).

## Project structure

```
app/                 # Next.js App Router pages & UI
  components/        # Navbar, auth guards, portfolio UI
  dashboard/         # Portfolio dashboard
  fund/              # Fund performance
  login/ register/   # Auth pages
  search/            # Fund research
  util/              # Auth + investment API clients
hooks/               # useAuth, useToast
mock-api/            # Express fake backend (seeded data)
components/ui/       # shadcn primitives
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js on `:3000` |
| `npm run mock-api` | Fake API on `:8081` and `:8888` |
| `npm run dev:all` | Mock API + Next (backgrounds API) |
| `npm test` | Run frontend (Vitest) + mock-api (`node --test`) suites |
| `npm run test:app` | Frontend unit/component tests only |
| `npm run test:api` | Mock API tests only |
| `npm run test:watch` | Vitest watch mode |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Tests

- **App:** Vitest + Testing Library — `AuthService`, portfolio math, allocation targets/drift, `RequireAuth` / `GuestOnly`
- **Mock API:** Node's built-in test runner + SuperTest — store, auth, portfolios, fund search

```bash
npm test
```

## Backend URLs

Configured in [`app/constants/index.tsx`](app/constants/index.tsx):

| Service | Default |
|---------|---------|
| Auth | `http://localhost:8081/api/v1/auth` |
| Investments / funds | `http://localhost:8888` |

The mock API is **in-memory** — data resets when the process restarts. Swap these URLs when pointing at a real backend.

## License

Private project (`0.1.0`).
