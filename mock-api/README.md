# MutualTrack Mock API

Fake dual-port backend for local frontend development. In-memory only — resets on restart.

## Ports

| Port | Service | Base path |
|------|---------|-----------|
| **8081** | Auth | `/api/v1/auth` |
| **8888** | Investments & funds | `/users/...`, `/fund/...` |

## Quick start

From the repo root:

```bash
npm run mock-api
```

Or:

```bash
cd mock-api && npm install && npm start
```

Run the Next app in another terminal:

```bash
npm run dev
```

Or both together (macOS / Linux):

```bash
npm run dev:all
```

(`dev:all` backgrounds the mock API, then starts Next.js.)

## Demo accounts

| Email | Password | Portfolio |
|-------|----------|-----------|
| `demo@mutualtrack.com` | `password123` | 11 holdings (rich dashboard) |
| `empty@mutualtrack.com` | `password123` | Empty (add / CAMS upload flows) |
| `active@mutualtrack.com` | `password123` | 4 holdings |

## Seed data

- **53** Indian mutual fund schemes across HDFC, ICICI, SBI, Axis, Nippon, Mirae, PPFAS, UTI, Kotak, Quant, Motilal Oswal, DSP
- Categories: Equity, Debt, Hybrid, Index
- Deterministic NAV history and period returns (`1M`–`SI`)

## Endpoints

### Auth (`:8081`)

- `POST /api/v1/auth/signup` — `{ email, password, username }`
- `POST /api/v1/auth/signin` — `{ email, password }` → tokens + `userProfile`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/change-password` — Bearer token + `{ oldPassword, newPassword }`
- `POST /api/v1/auth/refresh` — `{ refreshToken }`

### Investments (`:8888`)

- `GET /users/:userId/portfolios`
- `POST /users/:userId/upload` — multipart `file` (fake CAMS parse)
- `POST /users/:userId/investments` — `{ investments: [...] }`
- `PUT /users/:userId/investments/:id`
- `DELETE /users/:userId/investments/:id`
- `GET /fund/search?query=`
- `GET /fund/:schemeId` — performance series by period
- `GET /fund/:schemeId/details` — NAV, AUM, returns, history

## Health

- `GET http://localhost:8081/health`
- `GET http://localhost:8888/health`

## Tests

```bash
# from repo root
npm run test:api

# or from this folder
npm test
```
