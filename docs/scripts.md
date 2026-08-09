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
| `openDbWithSchema(dbPath?)` | Opens the DB, migrates legacy schema if needed, runs `DB_SCHEMA.sqlite.sql`, returns `{ db, migrated }`. |
| `isLegacyTrainingsSchema(db)` | Returns true if `trainings` has a `user_id` column (pre-normalization). |
| `migrateLegacySchema(db)` | Drops `training_rounds` and `trainings` when legacy schema is detected. |

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

**pnpm:** `pnpm db:seed-trainings`, `pnpm db:seed-hiit`, `pnpm db:seed-hiit-continuous`

Executes a `.sql` file against the current database.

```bash
node scripts/run-sql-file.mjs src/mocks/DB_SEED_trainings.sqlite.sql
```

- **When:** After users exist (assignment phase references user emails).
- **Idempotent:** Yes — seeds use `NOT EXISTS` / `INSERT OR IGNORE`.
- **Structure:** Each seed file inserts into the shared catalog (`trainings` + `training_rounds`), then assigns routines to MVP users via `users_trainings`.

---

### `seed-all.mjs`

**pnpm:** `pnpm db:seed-all`

Runs in order:

1. `seed-users.mjs`
2. `run-sql-file.mjs` with `DB_SEED_trainings.sqlite.sql`
3. `run-sql-file.mjs` with `DB_SEED_hiit_continuous_trainings.sqlite.sql`

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
- Legacy schema migration notice (if applicable)
- User count and emails
- Catalog count (`trainings`), assignment count (`users_trainings`)
- Orphan catalog entries (trainings with no assignments) and broken assignment rows
- Per-training assigned user count and full assignment list
- Warning if `/app/training.db` exists (ephemeral DB from misconfigured deploys)

```bash
pnpm db:status
railway ssh -- node scripts/db-status.mjs
```

Run this **before and after** seeds to confirm you are writing to the correct file.

---

### `cleanup-orphan-trainings.mjs`

**pnpm:** `pnpm db:cleanup-orphan-trainings`

Removes:

- Catalog trainings with **no** rows in `users_trainings` (and their rounds)
- Broken `users_trainings` rows (invalid `user_id` or `training_id`)

Typical cause: partial seed or manual DB edits.

```bash
pnpm db:cleanup-orphan-trainings
railway ssh -- node scripts/cleanup-orphan-trainings.mjs
```

- **Idempotent:** Yes — no-op if there are no orphans.

---

### `migrate-normalize-db.mjs`

**pnpm:** `pnpm db:migrate-normalize`

Explicitly migrates from the legacy schema (`trainings.user_id`) to the normalized schema (`trainings` catalog + `users_trainings` pivot).

- Preserves `users` and `sessions`
- Drops and recreates `trainings` and `training_rounds`
- Also runs automatically on app startup via `src/lib/db.ts`

```bash
pnpm db:migrate-normalize
pnpm db:seed-all
railway ssh -- node scripts/migrate-normalize-db.mjs
railway ssh -- node scripts/seed-all.mjs
```

After migration, **re-seed is required** to repopulate the catalog and assignments.

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
| `src/mocks/DB_SCHEMA.sqlite.sql` | Canonical schema (users, sessions, trainings, users_trainings, training_rounds). |
| `src/mocks/DB_SEED_trainings.sqlite.sql` | Sparring routines: catalog + MVP user assignments. |
| `src/mocks/DB_SEED_hiit_trainings.sqlite.sql` | HIIT routines (repetitions > 1). |
| `src/mocks/DB_SEED_hiit_continuous_trainings.sqlite.sql` | Continuous HIIT (`interval_seconds`). |

See also [database.md](./database.md) for the normalized data model.

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

If upgrading from the legacy schema (existing `training.db` with `trainings.user_id`):

```bash
pnpm db:migrate-normalize
pnpm db:seed-all
pnpm db:status
```

### Fresh Railway deploy

1. Volume at `/data`, `DB_PATH=/data/training.db`, `NODE_ENV=production`, `SEED_USER_*` set.
2. Wait for successful deploy (app migrates legacy schema on startup if needed).
3. `railway ssh -- node scripts/db-status.mjs` → confirm `/data/training.db`.
4. `railway ssh -- node scripts/seed-all.mjs`
5. `railway ssh -- node scripts/db-status.mjs` → expect 3 users, **3 catalog trainings**, **3 assignments per user** (from `seed-all`; run HIIT seeds separately for full catalog of 5).

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
| `db:migrate-normalize` | `migrate-normalize-db.mjs` |
| `db:seed-users` | `seed-users.mjs` |
| `db:seed-trainings` | `run-sql-file.mjs` + trainings SQL |
| `db:seed-hiit` | `run-sql-file.mjs` + HIIT SQL |
| `db:seed-hiit-continuous` | `run-sql-file.mjs` + HIIT continuous SQL |
| `db:seed-all` | `seed-all.mjs` |
| `db:status` | `db-status.mjs` |
| `db:cleanup-orphan-trainings` | `cleanup-orphan-trainings.mjs` |
