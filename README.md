DiQualia marketing site (Next.js) with a production-grade backend foundation using **Supabase (Postgres + Auth)** and **Prisma**.

## Getting Started

### 1) Create a Supabase project (PostgreSQL + Auth)

- Create a Supabase project in the dashboard.
- Collect these values from **Settings → API**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Collect Postgres connection strings from **Settings → Database**:
  - A pooled connection (Supavisor, usually port `6543`) for `DATABASE_URL`
  - A direct connection (usually port `5432`) for `DIRECT_DATABASE_URL`

### 2) Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### 3) Run migrations + generate Prisma client

```bash
npm run db:migrate
```

If your `DATABASE_URL` is a pooled Supabase connection (port `6543`), you may need to temporarily set `DATABASE_URL` to the **direct** connection string (port `5432`) when running migrations.

If you need to apply migrations in production/CI:

```bash
npm run db:deploy
```

Optional seed (dev only):

```bash
npm run db:seed
```

### 4) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## API endpoints (verification)

### POST `/api/leads` (public)

Valid request:

```bash
curl -s -X POST "http://localhost:3000/api/leads" \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com","name":"Test","message":"Hello","source":"contact-page"}'
```

Invalid request (missing both email + message) returns `400`:

```bash
curl -i -X POST "http://localhost:3000/api/leads" \
  -H "content-type: application/json" \
  -d '{"name":"Test"}'
```

### GET `/api/me` (auth check)

Logged out:

```bash
curl -s "http://localhost:3000/api/me"
```

Logged in: this endpoint relies on Supabase auth cookies set by your app (SSR helpers + middleware).

## Database + security notes

- **Supabase is PostgreSQL.** Prisma connects to Supabase Postgres via `DATABASE_URL` / `DIRECT_DATABASE_URL`.
- `leads` has **RLS enabled** and **no client policies** — write happens only through the Next.js API using Prisma.
- `profiles` has RLS enabled with policies for authenticated users to access their own row (`auth.uid() = id`).

## Optional: auto-create `profiles` on sign-up

If you want `public.profiles` to be created when a user signs up, add a trigger in Supabase SQL editor:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

