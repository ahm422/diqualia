# DiQualia

Marketing site (Next.js on Cloudflare Workers via OpenNext) with **D1**, **R2**, **Workers**, and **Cloudflare Email Service**. Admin auth is custom JWT (`jose`) + `bcryptjs`. Includes a self-contained RAG chatbot (`chatbot/`, see [`chatbot/README.md`](chatbot/README.md)).

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
EMBEDDINGS_PROVIDER=dummy RAG_ENABLED=true QDRANT_URL=http://localhost:6333 \
  npx next dev -H 0.0.0.0   # → http://localhost:3000
```

### 4) Run AI (chatbot / RAG)

```bash
docker start qdrant            # vector DB (or: docker run -d --name qdrant -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant)

# one-time setup: add to .env → DEEPSEEK_API_KEY=sk-..., EMBEDDINGS_PROVIDER=dummy, QDRANT_URL=http://localhost:6333
npm run kb:ingest              # build knowledge base (incremental; --force = full re-embed)
npm run dev                    # start server — RAG auto-enables when DEEPSEEK_API_KEY + Qdrant are up
```

Re-run `npm run kb:ingest` after CMS changes. Optional: `npm run kb:eval`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/chat` | RAG chatbot (`{"messages":[{"role":"user","content":"..."}]}`, streamed `text/plain`) |

## Stack

| Area | Implementation |
|------|----------------|
| App | Next.js + OpenNext Cloudflare |
| Database | Cloudflare D1 + Prisma D1 adapter |
| Storage | Cloudflare R2 |
| Email | Cloudflare Email Service (`send_email` → `EMAIL`) |
| Auth | Custom JWT (`jose`) + `bcryptjs` + RBAC |
| AI | LangChain + DeepSeek + Qwen3 embeddings + Qdrant |

## Deploy

See [`docs/DEPLOY-PHASE9.md`](docs/DEPLOY-PHASE9.md) and [`MIGRATION_D1_R2_WORKERS.md`](MIGRATION_D1_R2_WORKERS.md).
