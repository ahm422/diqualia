# DiQualia

Marketing site (Next.js on Cloudflare Workers via OpenNext) with **D1**, **R2**, **Workers**, and **Cloudflare Email Service**. Admin auth is custom JWT (`jose`) + `bcryptjs`. The website chatbot is a separate, Cloudflare-only Worker (`workers/chatbot/`, see [`workers/chatbot/README.md`](workers/chatbot/README.md)).

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

### 3) Run frontend

```bash
npm run dev       # http://127.0.0.1:3000 (fast UI iteration; no Worker bindings)
# OR authoritative Worker path:
npm run build
npm run preview   # http://127.0.0.1:8787
```

Network-accessible dev server:

```bash
npx next dev -H 0.0.0.0   # → http://localhost:3000
```

### 4) Run the chatbot Worker (second terminal)

```bash
cd workers/chatbot && npm install   # first time only
npm run chatbot:dev                 # from the repo root; shares local D1 with the site
```

The site reaches it through the `CHATBOT` service binding. Workers AI and
Vectorize always run remotely, so `wrangler login` is required. CMS changes
are re-indexed automatically (D1 triggers + cron); no manual ingest step.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/chat` | Chatbot (`{"message":"..."}`, streamed `text/plain`; history kept per browser session) |
| GET | `/api/chat` | Current session's conversation (`{"messages":[...]}`) |
| DELETE | `/api/chat` | Clear the current session's conversation |

## Stack

| Area | Implementation |
|------|----------------|
| App | Next.js + OpenNext Cloudflare |
| Database | Cloudflare D1 + Prisma D1 adapter |
| Storage | Cloudflare R2 |
| Email | Cloudflare Email Service (`send_email` → `EMAIL`) |
| Auth | Custom JWT (`jose`) + `bcryptjs` + RBAC |
| AI | Workers AI (Llama 3.3 70B, bge-m3, bge-reranker) + Vectorize + Durable Objects — `workers/chatbot` |

## Deploy

See [`docs/DEPLOY-PHASE9.md`](docs/DEPLOY-PHASE9.md) and [`MIGRATION_D1_R2_WORKERS.md`](MIGRATION_D1_R2_WORKERS.md).

The chatbot Worker is deployed separately and must exist before the website,
because the website's `CHATBOT` service binding points to it:

```bash
cd workers/chatbot && npm install && npx wrangler login
npm run deploy:all -- --site   # Vectorize index, D1 migrations, chatbot, then website
```

Details: [`workers/chatbot/README.md`](workers/chatbot/README.md#first-time-production-setup).

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

## Troubleshooting

In production, a server render error only shows up in the browser as a generic `500` / "Minified React error #441" with a `digest` value. To see the real exception, open **Workers & Pages → `diqualia-web` → Logs** in the Cloudflare dashboard and search for that digest, or stream the logs live with:

```bash
npx wrangler tail diqualia-web
```
