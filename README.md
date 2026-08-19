# Ring Training App

A full-stack web app for building and running boxing and HIIT training routines. Each user manages seeded sample routines plus up to **5 self-created routines**, with configurable rounds, work/rest timers, and a guided creation flow. Designed as a small MVP for a fixed set of authorized users (no public sign-up).

Installable as a **Progressive Web App (PWA)** on Android and iOS.

## What problem it solves

Coaches and athletes need a simple way to:

- Store reusable sparring or HIIT routines (round count, duration, rest)
- **Create custom routines** through a guided stepper (HIIT, HIIT extendido, sparring 2′ / 3′)
- Run a routine with on-screen timers during a session
- Remove routines from their personal list without breaking the shared catalog for others
- Access the same routines from phone or desktop without installing a native app

This app keeps everything on a single server with per-user data isolation—no shared spreadsheets or manual timers.

## Features

### Routine list (`/training`)

- View routines assigned to the logged-in user (seeded + user-created).
- **Nueva rutina** opens a mobile-first modal stepper to create a routine from scratch.
- Delete a routine from your list (unlink); if you were the last user with that routine, the catalog entry is removed too.
- Quota indicator: up to **5 user-created** routines (`is_user_created = 1` in the DB). Seeded routines do not count toward the limit.

### Guided routine creation

Stepper flow (validated with **Zod** on client and server):

1. **Name** — 3–80 characters, trim, single spaces, letters/numbers/spaces/`-`/`:` only.
2. **Type** — HIIT, HIIT Extendido, Sparring 2′, Sparring 3′.
3. **Configuration** — segment duration, rest, and rounds (options depend on type; sparring uses fixed round lengths).
4. **Confirmation** — review and save.

After save: success dialog, brief delay, then redirect to the new routine page. Errors show a dedicated dialog plus inline field messages.

### Routine runner (`/training/[slug]`)

- Timer for rounds and rest; supports HIIT multi-lap and continuous interval bells.
- Slug format: `{title-slug}-{id}` (e.g. `light-spar-1`).
- Access scoped to routines assigned to the current user.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Actions) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Lucide icons |
| Validation | [Zod](https://zod.dev) (shared client/server schemas) |
| Auth | [Lucia v3](https://lucia-auth.com) + `@lucia-auth/adapter-sqlite` |
| Database | [SQLite](https://www.sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Language | TypeScript |
| Testing | Jest, React Testing Library |
| Package manager | pnpm |
| Production host | [Railway](https://railway.com) (single service + persistent volume) |

## Screens & routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Login form (username + password). No sign-up link. |
| `/training` | Authenticated | List of the current user's routines + **Nueva rutina**. |
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

Creates `training.db` and applies the schema (including runtime migrations for new columns):

```bash
pnpm db:init
```

On app startup, `src/lib/db.ts` also applies idempotent migrations (`training_type`, `is_user_created`, etc.) against existing databases.

### 4. Seed data (order matters)

**Users first**, then sample routines:

```bash
pnpm db:seed-users
pnpm db:seed-trainings
```

Or run the default bundle (users + sparring + continuous HIIT):

```bash
pnpm db:seed-all
```

Optional extra catalog entries:

```bash
pnpm db:seed-hiit              # HIIT multi-lap routines
pnpm db:seed-hiit-continuous   # included in db:seed-all
```

Verify:

```bash
pnpm db:status
```

After `db:seed-all`, expect **3 users** and **3 catalog routines** assigned to each user. Run `db:seed-hiit` for the full **5-routine** sample catalog.

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), log in with a seeded user, and try **Nueva rutina** on `/training`.

### 6. Run tests (optional)

```bash
pnpm test
pnpm lint
```

## Available commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build locally |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest unit/integration tests |
| `pnpm test:watch` | Jest in watch mode |
| `pnpm db:init` | Create DB + schema |
| `pnpm db:migrate-normalize` | Migrate legacy schema to normalized catalog + `users_trainings` |
| `pnpm db:migrate-training-type` | Verify/apply `training_type` column migration (also runs on startup) |
| `pnpm db:seed-users` | Insert authorized users from env |
| `pnpm db:seed-trainings` | Sparring sample routines (catalog + assignments) |
| `pnpm db:seed-hiit` | HIIT multi-lap sample routines |
| `pnpm db:seed-hiit-continuous` | Continuous HIIT sample routine |
| `pnpm db:seed-all` | Users + sparring + continuous HIIT |
| `pnpm db:status` | Print DB path, users, catalog, assignments |
| `pnpm db:cleanup-orphan-trainings` | Remove catalog trainings with no user assignments |
| `pnpm icons:generate` | Regenerate PWA icon assets |

See [docs/database.md](./docs/database.md) for schema details (`training_type`, `is_user_created`, creation quota, delete behavior).

See [docs/scripts.md](./docs/scripts.md) for what each script does in detail.

## Production (Railway)

Deployment uses a **persistent volume** at `/data` so SQLite survives redeploys.

1. Connect the GitHub repo to Railway.
2. Add a volume with mount path `/data`.
3. Set service variables: `DB_PATH=/data/training.db`, `NODE_ENV=production`, and `SEED_USER_*` pairs.
4. Generate a public domain (Settings → Networking).
5. Deploy; the app applies schema migrations on startup (`training_type`, `is_user_created`, etc.).
6. Seed **inside the running container** (not on your laptop):

```bash
railway link
railway ssh -- node scripts/db-status.mjs
railway ssh -- node scripts/seed-all.mjs
railway ssh -- node scripts/db-status.mjs
```

After a major schema refactor (legacy `trainings.user_id`), re-seed inside the container so the shared catalog and assignments are repopulated.

Full guide: [docs/railway-deployment.md](./docs/railway-deployment.md)

**Important:** Use `railway ssh -- node scripts/...`, not `railway run`. Only SSH runs commands inside the container where `/data` is mounted.

## Security model (MVP)

- Public sign-up is disabled; users are created via seed scripts only.
- Login rate limiting (in-memory, per IP).
- Routine creation rate limiting (in-memory, per user) plus a **5 user-created routine** quota enforced server-side.
- Server Actions validate all create payloads with **Zod** (`unknown` input → parse → typed data); never trust the client.
- Routine detail pages require ownership (assignment in `users_trainings`).
- Security headers (CSP, HSTS in production, etc.).
- Session cookies are `Secure` when `NODE_ENV=production`.

Audit checklist: [docs/security-audit.md](./docs/security-audit.md)

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/database.md](./docs/database.md) | Normalized schema, ER diagram, migrations, creation quota |
| [docs/scripts.md](./docs/scripts.md) | Database & maintenance scripts |
| [docs/railway-deployment.md](./docs/railway-deployment.md) | Railway deploy, volume, env vars, seeds |
| [docs/security-audit.md](./docs/security-audit.md) | Pre-launch security checklist |
| [docs/share-with-users.md](./docs/share-with-users.md) | How to share the app with the 3 MVP users |

## Project layout (high level)

```
src/
  app/                    # Next.js routes (login, training list, routine runner)
  actions/                # Server Actions (create/delete routine, auth)
  components/
    training/CreateRoutine/   # Stepper modal, steps, success/error dialogs
    training/               # Cards, timers, lists
    ui/                     # Button, modal, status dialog, confirm dialog
  lib/
    validation/             # Zod schemas (routine name, create payload)
    routines/               # Routine types, limits, domain mapping
    repositories/           # SQLite data access
    auth/                   # Lucia, rate limits
    db.ts                   # Connection + idempotent migrations
  middleware.ts             # Protect /training routes
scripts/                    # DB init, seed, migrate, status, cleanup
docs/                       # Deployment, scripts, security, user onboarding
```

## License

Private MVP — not intended for public distribution.
