# Ring Training App

A full-stack web app for building and running boxing and HIIT training routines. Each user manages up to 10 routines with configurable rounds, work/rest timers, and completion tracking. Designed as a small MVP for a fixed set of authorized users (no public sign-up).

Installable as a **Progressive Web App (PWA)** on Android and iOS.

## What problem it solves

Coaches and athletes need a simple way to:

- Store reusable sparring or HIIT routines (round count, duration, rest)
- Run a routine with on-screen timers during a session
- Track how many times each routine was completed
- Access the same routines from phone or desktop without installing a native app

This app keeps everything on a single server with per-user data isolation—no shared spreadsheets or manual timers.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Actions) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Lucide icons |
| Auth | [Lucia v3](https://lucia-auth.com) + `@lucia-auth/adapter-sqlite` |
| Database | [SQLite](https://www.sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Language | TypeScript |
| Package manager | pnpm |
| Production host | [Railway](https://railway.com) (single service + persistent volume) |

## Screens & routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Login form (username + password). No sign-up link. |
| `/training` | Authenticated | List of the current user's routines. |
| `/training/[slug]` | Authenticated | Active routine view with round/rest timer (slug encodes routine id, e.g. `light-spar-1`). |
| `/manifest.webmanifest` | Public | PWA manifest (name, icons, theme). |

Unauthenticated requests to `/training/*` are redirected to `/` by middleware.

## Prerequisites

- **Node.js 22** (see `.node-version`)
- **pnpm** 9+
- Native build tools for `better-sqlite3` (Python + C++ compiler on Linux/macOS; Visual Studio Build Tools on Windows)

## Local setup (step by step)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy the example file and fill in real passwords:

```bash
cp .env.example .env.local
```

Required for seeding users locally:

| Variable | Example |
|----------|---------|
| `DB_PATH` | `training.db` (default; file in project root) |
| `SEED_USER_1_EMAIL` | `diego@test.com` |
| `SEED_USER_1_PASSWORD` | your password |
| `SEED_USER_2_EMAIL` | `profe` |
| `SEED_USER_2_PASSWORD` | your password |
| `SEED_USER_3_EMAIL` | `alumno` |
| `SEED_USER_3_PASSWORD` | your password |

`.env.local` is gitignored. Never commit passwords.

### 3. Initialize the database

Creates `training.db` and applies the schema:

```bash
pnpm db:init
```

### 4. Seed data (order matters)

**Users first**, then optional sample routines:

```bash
pnpm db:seed-users
pnpm db:seed-trainings
```

Or run both in one step:

```bash
pnpm db:seed-all
```

Verify:

```bash
pnpm db:status
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with one of the seeded users.

## Available commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest unit tests |
| `pnpm db:init` | Create DB + schema |
| `pnpm db:seed-users` | Insert authorized users from env |
| `pnpm db:seed-trainings` | Insert sample routines (SQL seed) |
| `pnpm db:seed-all` | Users + trainings in one run |
| `pnpm db:status` | Print DB path, users, and routines |
| `pnpm db:cleanup-orphan-trainings` | Remove routines with no owner |

See [docs/scripts.md](./docs/scripts.md) for what each script does in detail.

## Production (Railway)

Deployment uses a **persistent volume** at `/data` so SQLite survives redeploys.

1. Connect the GitHub repo to Railway.
2. Add a volume with mount path `/data`.
3. Set service variables: `DB_PATH=/data/training.db`, `NODE_ENV=production`, and `SEED_USER_*` pairs.
4. Generate a public domain (Settings → Networking).
5. Seed **inside the running container** (not on your laptop):

```bash
railway link
railway ssh -- node scripts/db-status.mjs
railway ssh -- node scripts/seed-all.mjs
```

Full guide: [docs/railway-deployment.md](./docs/railway-deployment.md)

**Important:** Use `railway ssh -- node scripts/...`, not `railway run`. Only SSH runs commands inside the container where `/data` is mounted.

## Security model (MVP)

- Public sign-up is disabled; users are created via seed scripts only.
- Login rate limiting (in-memory, per IP).
- Security headers (CSP, HSTS in production, etc.).
- Session cookies are `Secure` when `NODE_ENV=production`.

Audit checklist: [docs/security-audit.md](./docs/security-audit.md)

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/scripts.md](./docs/scripts.md) | Database & maintenance scripts |
| [docs/railway-deployment.md](./docs/railway-deployment.md) | Railway deploy, volume, env vars, seeds |
| [docs/security-audit.md](./docs/security-audit.md) | Pre-launch security checklist |
| [docs/share-with-users.md](./docs/share-with-users.md) | How to share the app with the 3 MVP users |

## Project layout (high level)

```
src/
  app/              # Next.js routes (login, training list, routine runner)
  components/       # UI (auth form, training cards, timers, PWA)
  lib/              # DB, auth, repositories, rate limit
  middleware.ts     # Protect /training routes
scripts/            # DB init, seed, status, cleanup (see docs/scripts.md)
docs/               # Deployment, scripts, security, user onboarding
```

## License

Private MVP — not intended for public distribution.
