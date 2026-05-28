# Scripts reference

All scripts live in [`scripts/`](../scripts/) and operate on the SQLite database resolved by `getDbPath()` in [`db-utils.mjs`](../scripts/db-utils.mjs).

## How the database path is chosen

`getDbPath()` (used by every script) picks the file in this order:

1. **Absolute `DB_PATH`** (e.g. `/data/training.db`) — used only if the parent directory exists (runtime on Railway with volume).
2. **Volume fallback** — if `/data` exists, use `/data/training.db` even when `DB_PATH` is a relative value like `training.db`.
3. **Relative `DB_PATH`** — resolved against the project root (local dev).
4. **Default** — `training.db` in the project root.

During `next build`, `/data` does not exist yet, so the app must not open `/data/training.db` at build time. See [`src/lib/db.ts`](../src/lib/db.ts) for the same rules in the Next.js server.

| Context | Typical `DB_PATH` env | Effective file |
|---------|----------------------|----------------|
| Local dev | `training.db` | `./training.db` |
| Railway runtime | `/data/training.db` | `/data/training.db` |
| Railway build | `/data/training.db` (env set) | fallback until `/data` exists |

---

## Shared utilities

### `db-utils.mjs`

Core helper module (not run directly).

| Export | Purpose |
|--------|---------|
| `getDbPath()` | Returns the SQLite file path for the current environment. |
| `getDbPathResolution()` | Returns `{ effective, reason }` for debugging (used by `db-status.mjs`). |
| `openDbWithSchema(dbPath?)` | Opens the DB with better-sqlite3 and runs `src/mocks/DB_SCHEMA.sqlite.sql` (`CREATE TABLE IF NOT EXISTS`). |

### `load-env.mjs`

Loads `.env.local` and `.env` into `process.env` **without overwriting** variables already set (e.g. Railway injects secrets at runtime).

Used by: `seed-users.mjs`.

---

## Database lifecycle scripts

### `init-db.mjs`

**pnpm:** `pnpm db:init`

Creates the database file (if missing) and applies the schema.

```bash
node scripts/init-db.mjs
```

- **When:** First local setup, or after deleting `training.db`.
- **Production:** Usually unnecessary—the app creates tables on startup via `src/lib/db.ts`.
- **Idempotent:** Yes (`CREATE TABLE IF NOT EXISTS`).

---

### `seed-users.mjs`

**pnpm:** `pnpm db:seed-users`

Creates authorized MVP users from environment variables.

**Required env (pairs must be complete):**

```
SEED_USER_1_EMAIL / SEED_USER_1_PASSWORD
SEED_USER_2_EMAIL / SEED_USER_2_PASSWORD
...
SEED_USER_N_*   (up to 10)
```

- **Password hashing:** scrypt + random salt (same format as login verification).
- **Idempotent:** Yes — `INSERT OR IGNORE`; existing emails are skipped, passwords are **not** updated on re-run.
- **Local:** Reads from `.env.local` via `load-env.mjs`.
- **Railway:** Reads from service Variables; must run via SSH:

```bash
railway ssh -- node scripts/seed-users.mjs
```

---

### `run-sql-file.mjs`

**pnpm:** `pnpm db:seed-trainings` (wraps the trainings SQL file)

Executes a `.sql` file against the current database.

```bash
node scripts/run-sql-file.mjs src/mocks/DB_SEED_trainings.sqlite.sql
```

- **When:** After users exist (trainings reference `user_id` via email subquery).
- **Idempotent:** **No** — each run inserts new rows. Avoid running twice unless you want duplicates.
- **Default seed file:** `src/mocks/DB_SEED_trainings.sqlite.sql` (sample sparring routines for `diego@test.com`).

---

### `seed-all.mjs`

**pnpm:** `pnpm db:seed-all`

Runs in order:

1. `seed-users.mjs`
2. `run-sql-file.mjs` with `DB_SEED_trainings.sqlite.sql`

Prints the resolved DB path before seeding.

```bash
# Local
pnpm db:seed-all

# Railway
railway ssh -- node scripts/seed-all.mjs
```

Use this for first-time production setup after deploy.

---

## Inspection & maintenance

### `db-status.mjs`

**pnpm:** `pnpm db:status`

Diagnostic report:

- `NODE_ENV`, `DB_PATH` (raw env), volume mount (`/data`), effective path, resolution reason
- User count and emails
- Training count, orphan count (`user_id IS NULL`), owner per routine
- Warning if `/app/training.db` exists (ephemeral DB from misconfigured deploys)

```bash
pnpm db:status
railway ssh -- node scripts/db-status.mjs
```

Run this **before and after** seeds to confirm you are writing to the correct file.

---

### `cleanup-orphan-trainings.mjs`

**pnpm:** `pnpm db:cleanup-orphan-trainings`

Deletes trainings (and their rounds) where `user_id IS NULL`.

Typical cause: running the trainings seed with a wrong email in the SQL (user subquery returned NULL).

```bash
pnpm db:cleanup-orphan-trainings
railway ssh -- node scripts/cleanup-orphan-trainings.mjs
```

- **Idempotent:** Yes — no-op if there are no orphans.

---

### `reset-dev-password.mjs`

**No pnpm alias** — run directly.

Admin/dev tool for password changes and emergency user creation.

**Reset password:**

```bash
node scripts/reset-dev-password.mjs <email> <new-password>
```

**Create user (emergency only; prefer `seed-users.mjs`):**

```bash
node scripts/reset-dev-password.mjs --create-user <email> <password>
```

- **Updates password:** Overwrites hash for existing email.
- **Not for production routine** unless you SSH into Railway and run it there against `/data/training.db`.

Public sign-up in the UI is disabled; this script is the supported way to recover locked-out users.

---

## SQL & schema assets

| File | Role |
|------|------|
| `src/mocks/DB_SCHEMA.sqlite.sql` | Canonical schema (users, sessions, trainings, training_rounds). |
| `src/mocks/DB_SEED_trainings.sqlite.sql` | Sample routines seed (edit owner email before production seed). |

---

## Common workflows

### Fresh local machine

```bash
pnpm install
cp .env.example .env.local
pnpm db:init
pnpm db:seed-all
pnpm db:status
pnpm dev
```

### Fresh Railway deploy

1. Volume at `/data`, `DB_PATH=/data/training.db`, `NODE_ENV=production`, `SEED_USER_*` set.
2. Wait for successful deploy.
3. `railway ssh -- node scripts/db-status.mjs` → confirm `/data/training.db`.
4. `railway ssh -- node scripts/seed-all.mjs`
5. `railway ssh -- node scripts/db-status.mjs` → expect 3 users, 2 trainings.

### Wrong trainings seed (orphans)

```bash
railway ssh -- node scripts/cleanup-orphan-trainings.mjs
railway ssh -- node scripts/run-sql-file.mjs src/mocks/DB_SEED_trainings.sqlite.sql
```

### `railway run` vs `railway ssh`

| Command | Where it runs | Writes to prod volume? |
|---------|---------------|-------------------------|
| `railway run node scripts/...` | Your laptop (with Railway env vars) | **No** |
| `railway ssh -- node scripts/...` | Inside the deployed container | **Yes** |

Always use **SSH** for production seeds.

---

## package.json script map

| npm script | Script file |
|------------|-------------|
| `db:init` | `init-db.mjs` |
| `db:seed-users` | `seed-users.mjs` |
| `db:seed-trainings` | `run-sql-file.mjs` + trainings SQL |
| `db:seed-all` | `seed-all.mjs` |
| `db:status` | `db-status.mjs` |
| `db:cleanup-orphan-trainings` | `cleanup-orphan-trainings.mjs` |
