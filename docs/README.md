# Documentation index

Guides for running, deploying, and maintaining **Ring Training App**.

| Document | Audience | Contents |
|----------|----------|----------|
| [scripts.md](./scripts.md) | Developers | Every file in `scripts/`: purpose, env vars, idempotency, local vs Railway |
| [railway-deployment.md](./railway-deployment.md) | DevOps / deploy | Volume, env vars, seeds via SSH, PWA install, troubleshooting |
| [security-audit.md](./security-audit.md) | Pre-launch | Headers, auth, dependency audit, manual checks |
| [share-with-users.md](./share-with-users.md) | Product / ops | Onboarding the 3 MVP users, PWA install instructions |

## Quick reference: command order

### Local (first time)

```bash
pnpm install
cp .env.example .env.local   # edit passwords
pnpm db:init
pnpm db:seed-all
pnpm dev
```

### Railway (after deploy)

```bash
railway link
railway ssh -- node scripts/db-status.mjs
railway ssh -- node scripts/seed-all.mjs
```

Never use `railway run` for seeds in production—it runs on your machine, not on the `/data` volume.
