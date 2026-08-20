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
