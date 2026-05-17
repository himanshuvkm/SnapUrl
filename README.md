# SnapURL — URL Shortener with Analytics

> A production-grade URL shortener built with Next.js, Redis, PostgreSQL, and Docker. Features sub-10ms cached redirects, click analytics, rate limiting, and a full Vitest test suite.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Redis](https://img.shields.io/badge/Redis-7-red?style=flat-square&logo=redis)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![Tests](https://img.shields.io/badge/Tests-17%20passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## What is SnapURL?

SnapURL is a full-stack URL shortener that goes beyond basic link shortening. It tracks every redirect with device breakdowns and a 7-day click timeline, uses Redis to serve cached redirects in under 10ms, and rate-limits abuse using Redis counters. The entire stack — app, database, and cache — runs in Docker with a single command.

**Live demo:** [your-demo-link-here] &nbsp;|&nbsp; **Video walkthrough:** [your-loom-link-here]

---

## Features

- **URL Shortening** — Custom or auto-generated slugs via nanoid
- **Redis Caching** — Cache-aside pattern; ~9ms cache hit vs ~70ms DB-only
- **Rate Limiting** — 100 requests/min per IP using Redis INCR + EXPIRE
- **Click Analytics** — Total clicks, device breakdown (desktop/mobile/tablet), 7-day timeline
- **JWT Auth** — Secure register/login, protected routes, token-based API access
- **Full Test Suite** — 17 Vitest unit + integration tests, Redis mocked with ioredis-mock
- **Docker** — One-command setup for app + PostgreSQL + Redis
- **CI/CD** — GitHub Actions runs tests on every push, Docker build on merge to main

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16, Prisma ORM |
| Cache | Redis 7, ioredis |
| Auth | JWT, bcryptjs |
| Testing | Vitest, ioredis-mock |
| DevOps | Docker, docker-compose, GitHub Actions |

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client                         │
└─────────────────────┬───────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────┐
│              Next.js App (Port 3000)             │
│                                                  │
│  ┌─────────────┐    ┌──────────────────────────┐ │
│  │  API Routes │    │     Page Routes           │ │
│  │  /api/url   │    │  /[slug] → redirect       │ │
│  │  /api/auth  │    │  /dashboard               │ │
│  └──────┬──────┘    └──────────┬───────────────┘ │
│         │                      │                  │
│  ┌──────▼──────────────────────▼───────────────┐ │
│  │              Redis (Cache Layer)             │ │
│  │   url:{slug} → longUrl  (TTL: 24hr)         │ │
│  │   rate_limit:{ip} → count (TTL: 60s)        │ │
│  │   clicks:{slug} → count                     │ │
│  └──────────────────────┬──────────────────────┘ │
│                         │ cache miss only         │
│  ┌──────────────────────▼──────────────────────┐ │
│  │           PostgreSQL (Source of Truth)       │ │
│  │   users · links · clicks                    │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## How Redis is Used

### 1. Cache-aside pattern for redirects

Every short link redirect checks Redis first. Only on a cache miss does it query PostgreSQL, then writes the result back to Redis for next time.

```
GET /:slug
    │
    ├─► Redis GET url:{slug}
    │       │
    │   HIT ├─► redirect (~9ms) ✓
    │       │
    │  MISS └─► PostgreSQL query (~70ms)
    │               │
    │               └─► Redis SET url:{slug} (TTL 24hr)
    │               └─► redirect
```

### 2. Rate limiting with INCR + EXPIRE

```
Every request from IP:
  INCR rate_limit:{ip}      → increment counter
  if count === 1:
    EXPIRE rate_limit:{ip} 60   → set 60s window on first request
  if count > 100:
    return 429 Too Many Requests
```

### 3. Click counters

Fast click counts without hitting PostgreSQL on every analytics read:

```
On redirect: INCR clicks:{slug}
On analytics: GET clicks:{slug}  → instant, no DB join
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- That's it

### Run with Docker (recommended)

```bash
# Clone the repo
git clone https://github.com/himanshuvkm/snapurl.git
cd snapurl

# Start everything — app + PostgreSQL + Redis
docker compose up --build

# Visit http://localhost:3000
```

Migrations run automatically on startup. No manual setup needed.

### Run locally (without Docker)

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET

# Run database migrations
npx prisma migrate dev

# Start Redis locally
docker run -d -p 6379:6379 redis:alpine

# Start the dev server
npm run dev
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snapurl
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login, get JWT | No |

### URLs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/url/shorten` | Shorten a URL | Yes |
| GET | `/api/url` | Get all your links | Yes |
| DELETE | `/api/url/:slug/delete` | Delete a link | Yes |
| GET | `/api/url/:slug/analytics` | Get click analytics | Yes |
| GET | `/api/health` | Health check (Redis + DB) | No |

### Example — shorten a URL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"123456"}'

# Shorten
curl -X POST http://localhost:3000/api/url/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"longUrl":"https://github.com/himanshuvkm","customSlug":"himanshu"}'

# Response
{
  "shortUrl": "http://localhost:3000/himanshu",
  "slug": "himanshu",
  "longUrl": "https://github.com/himanshuvkm",
  "createdAt": "2026-05-17T12:00:00.000Z"
}
```

---

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test coverage

| File | What's tested |
|---|---|
| `auth.test.ts` | Register (success, duplicate, validation), Login (success, wrong password, not found) |
| `url.test.ts` | Shorten (success, invalid URL, no auth, duplicate slug), Redis cache write, Delete (success, forbidden, not found) |

All tests run with mocked Prisma and ioredis-mock — no real database or Redis needed. Tests run in CI on every push via GitHub Actions.

```
✓ tests/auth.test.ts  (7 tests)
✓ tests/url.test.ts   (10 tests)

Test Files  2 passed
Tests       17 passed
Duration    ~1s
```

---

## Docker

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View app logs
docker compose logs -f app

# Stop everything
docker compose down

# Full reset (wipes database)
docker compose down -v
```

The `docker-compose.yml` runs three services — `app`, `db` (PostgreSQL), and `redis` — with health checks ensuring the app only starts after both database and cache are ready.

---

## Project Structure

```
snapurl/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── url/
│   │   │   ├── shorten/route.ts
│   │   │   ├── route.ts
│   │   │   └── [slug]/
│   │   │       ├── analytics/route.ts
│   │   │       └── delete/route.ts
│   │   └── health/route.ts
│   ├── [slug]/page.tsx        # redirect with Redis cache-aside
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts                  # Prisma singleton
│   ├── redis.ts               # ioredis singleton (lazy connect)
│   └── auth.ts                # JWT helpers
├── middlewares/
│   ├── withAuth.ts            # JWT route wrapper
│   └── rateLimiter.ts         # Redis rate limiter
├── prisma/
│   ├── schema.prisma
│   └── migrate.sh
├── tests/
│   ├── setup.ts               # global mocks
│   ├── auth.test.ts
│   └── url.test.ts
├── Dockerfile                 # multi-stage build
├── docker-compose.yml         # app + postgres + redis
├── vitest.config.ts
└── .github/workflows/ci.yml
```

---

## What I Learned Building This

- **Redis cache-aside pattern** — when to cache, when to invalidate, TTL strategy
- **Redis rate limiting** — INCR + EXPIRE is simpler and faster than any middleware library
- **Multi-stage Docker builds** — builder stage compiles, runner stage is lean (~60% smaller image)
- **Mocking in tests** — ioredis-mock lets you test Redis logic without a real server
- **Next.js 15 async params** — params and headers() are now Promises in route handlers

---

## Author

**Himanshu Vishwakarma**
[GitHub](https://github.com/himanshuvkm) · [LinkedIn](https://linkedin.com/in/himanshuvkm) · [Email](mailto:himanshuvkm252@gmail.com)

---

## License

MIT