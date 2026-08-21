# DiQualia

Marketing site (Next.js on Cloudflare Workers via OpenNext) with **D1**, **R2**, **Workers**, and **Cloudflare Email Service**. Admin auth is custom JWT (`jose`) + `bcryptjs`.

## Getting started

### 1) Configure local secrets

```bash
cp .env.example .env          # ADMIN_EMAIL, ADMIN_PASSWORD (seed only)
cp .dev.vars.example .dev.vars # JWT_SECRET, ADMIN_EMAIL, COOKIE_SECURE=false
npm install
```

Worker bindings (D1 `DB`, R2, `EMAIL`) live in [`wrangler.jsonc`](wrangler.jsonc). Contact notifications use `env.EMAIL.send` from `noreply@diqualia.com` (no Resend keys).

### 2) Local D1 + admin seed

```bash
npm run db:migrate
npm run db:seed:admin
# optional CMS from existing scratch/export.json:
# npm run db:import:local -- --force
```

### 3) Preview (authoritative Worker path)

```bash
npm run build
npm run preview   # http://127.0.0.1:8787
npm run cf:e2e    # local loopback only — never point at shared/preview/prod D1
```

For fast UI iteration you can also use `npm run dev` (Next only; no Worker bindings — contact email is skipped gracefully).

## Stack

| Area | Implementation |
|------|----------------|
| App | Next.js + OpenNext Cloudflare |
| Database | Cloudflare D1 + Prisma D1 adapter |
| Storage | Cloudflare R2 |
| Email | Cloudflare Email Service (`send_email` → `EMAIL`) |
| Auth | Custom JWT (`jose`) + `bcryptjs` + RBAC (seeded `super_admin` / `admin` / `editor`; `ADMIN_EMAIL` is bootstrap seed + notification recipient, not a login allowlist) |

## Deploy

See [`docs/DEPLOY-PHASE9.md`](docs/DEPLOY-PHASE9.md) and [`MIGRATION_D1_R2_WORKERS.md`](MIGRATION_D1_R2_WORKERS.md).

## Scheduled jobs

| Job | Schedule | What it does |
|-----|----------|---------------|
| Stale career-application draft cleanup | Daily 03:00 UTC (`triggers.crons` in `wrangler.jsonc`) | Hard-deletes `career_application_drafts` rows with `status = 'in_progress'` and `updated_at` older than 30 days (no matching submitted application), including their R2 resume/photo objects. `status = 'completed'` drafts are never touched — their R2 keys are shared with the resulting `job_applications` row. See [`lib/careers/cleanup-drafts.ts`](lib/careers/cleanup-drafts.ts) and issue #102. |

The Cron Trigger is wired via [`src/worker/custom-worker.ts`](src/worker/custom-worker.ts), which wraps OpenNext's generated `fetch` handler and adds `scheduled()` (OpenNext's Cloudflare adapter doesn't expose a hook for this). `wrangler.jsonc`'s `main` points here instead of directly at `.open-next/worker.js`.

Dry-run / manual invocation (see the script's header comment for all flags):

```bash
npx tsx scripts/cleanup-stale-drafts.ts              # local D1, dry-run (default)
npx tsx scripts/cleanup-stale-drafts.ts --remote --run
```
