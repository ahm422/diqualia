# DiQualia

The website and content-management platform for **DiQualia**. It is a marketing
site with a built-in admin panel, a careers and applicant portal, a blog, and an
AI website assistant. Everything runs on Cloudflare's edge.

## Features

- **Public website.** Home, About, Services, How We Work, Industries, Story,
  Blog, Careers and Contact pages. Light and dark themes, responsive down to
  mobile, with SEO metadata, a sitemap and structured data.
- **Admin panel (`/admin`).** Staff can edit almost every headline, section,
  image, the navigation and the footer without a developer. The panel also
  covers:
  - Blog posts, written in a rich-text editor and saved as drafts or published.
  - Job openings.
  - Contact enquiries and job applications.
  - Admin users, with role-based permissions.
- **Careers and applicant portal (`/portal`).** Candidates apply through a
  multi-step form with CV upload and duplicate-application checks. Each applicant
  gets a private portal account where they can follow the status of their
  application.
- **AI website assistant.** A chat widget that answers visitors' questions using
  the site's own published content. It runs as a separate Cloudflare Worker and
  re-indexes automatically when content changes.
- **Email notifications.** Enquiry and application emails are sent through
  Cloudflare Email Service.
- **Scheduled maintenance.** A daily job removes abandoned application drafts
  and their uploaded files.

## Tech stack

| Area | Technology |
|------|------------|
| Framework | [Next.js](https://nextjs.org) (App Router), React, TypeScript |
| Hosting | Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare) |
| Database | Cloudflare D1 (SQLite) with Prisma |
| File storage | Cloudflare R2 |
| Email | Cloudflare Email Service |
| Auth | JWT sessions (`jose`) + `bcryptjs`, role-based access control |
| AI assistant | Workers AI, Vectorize, Durable Objects |
| UI | Tailwind CSS, Radix UI, TipTap rich-text editor |

## Project structure

```
app/              Next.js routes: public site, /admin, /portal and API routes
components/       Shared UI components
lib/              Business logic, validation schemas, auth and helpers
prisma/           Prisma schema and seed data
d1/migrations/    D1 database migrations
src/worker/       Custom Worker entry (adds the scheduled cleanup job)
workers/chatbot/  The AI website assistant (separate Cloudflare Worker)
scripts/          Database, seeding and test tooling
docs/             Plain-language guides for site owners and staff
```

## Getting started

**Requirements:** Node.js 20+ and npm. Running the Worker build and the AI
assistant also needs a Cloudflare account.

```bash
# 1. Install dependencies
npm install

# 2. Create local config from the examples and fill in your own values
cp .env.example .env
cp .dev.vars.example .dev.vars

# 3. Create the local database and an admin user
npm run db:migrate
npm run db:seed:admin

# 4. Start the site
npm run dev        # fast UI development at http://127.0.0.1:3000
```

To run the full Cloudflare Worker locally, with the database, storage and email
bindings, build it and use the preview server:

```bash
npm run build
npm run preview    # http://127.0.0.1:8787
```

To run the AI assistant alongside the site, start it in a second terminal. It
needs `npx wrangler login`, because Workers AI and Vectorize always run remotely:

```bash
cd workers/chatbot && npm install
cd ../.. && npm run chatbot:dev
```

> **Never commit real secrets.** `.env` and `.dev.vars` are git-ignored. Only
> the `*.example` files belong in the repository.

## Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm run preview` | Build and run the Cloudflare Worker locally |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply D1 migrations to the local database |
| `npm run db:seed:admin` | Create the first admin user locally |
| `npm run test:*` | Unit tests (e.g. `test:cnic`, `test:career-apply`, `test:portal-status`) |
| `npm run cf:e2e:rbac` / `cf:e2e:portal` | End-to-end permission and portal tests against the local preview |

## Deployment

The site deploys to Cloudflare Workers with `npm run deploy`. Before you deploy
to your own account:

1. In `wrangler.jsonc` and `workers/chatbot/wrangler.jsonc`, replace the
   placeholders with your own values:
   - `YOUR_CLOUDFLARE_ACCOUNT_ID`
   - `YOUR_D1_DATABASE_ID`
   - `pub-your-r2-bucket-id.r2.dev`

   Also change the domain in `routes`. The same R2 URL is used in
   `.env.example` and the CI workflow.
2. Set the production secrets with `wrangler secret put`.

The AI assistant Worker must be deployed first, because the website connects to
it through a service binding (`npm run chatbot:deploy`).

## Documentation

Plain-language guides for site owners and staff are in [`docs/`](docs/README.md):
a product overview, a website tour, the admin guide, the applicant portal guide,
and an FAQ.
