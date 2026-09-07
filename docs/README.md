# DiQualia — Documentation

This folder is split into two audiences.

| Folder | For whom | Contents |
|--------|----------|----------|
| [`technical/`](./technical/) | Developers who will maintain, extend, or redeploy the app | Architecture, folder map, DB schema/ERD, API reference, auth & RBAC, environment variables, third-party services, deployment & infra, local dev, known issues / tech debt, handoff checklist |
| [`non-technical/`](./non-technical/) | The client and their staff | Plain-language product overview, screen-by-screen website tour, admin/CMS guide, applicant-portal guide, FAQ & glossary |

## Technical index

| # | Document | Summary |
|---|----------|---------|
| 01 | [Architecture overview](./technical/01-architecture-overview.md) | Stack, hosting model, request lifecycle, rendering strategy, diagram |
| 02 | [Folder structure](./technical/02-folder-structure.md) | What lives where in the repo |
| 03 | [Database schema & ERD](./technical/03-database-schema.md) | Every table, relationships, migrations, seeds |
| 04 | [API reference](./technical/04-api-reference.md) | All route handlers: method, auth, purpose, request/response shape |
| 05 | [Authentication & RBAC](./technical/05-authentication-and-rbac.md) | Admin JWT, applicant-portal JWT, permission catalog, roles, middleware |
| 06 | [Environment variables](./technical/06-environment-variables.md) | Every var/secret, where it lives, who owns it |
| 07 | [Third-party services](./technical/07-third-party-services.md) | Cloudflare products, Google Fonts, account ownership |
| 08 | [Deployment & infrastructure](./technical/08-deployment-and-infrastructure.md) | Build pipeline, Wrangler config, CI, cron, DNS/SSL, ownership handoff |
| 09 | [Local development](./technical/09-local-development.md) | First-run setup, the two dev modes, tests, common tasks |
| 10 | [Known issues & tech debt](./technical/10-known-issues-and-tech-debt.md) | Everything a future maintainer should not be surprised by |
| 11 | [Packaging & handoff checklist](./technical/11-packaging-and-handoff-checklist.md) | The 8-step delivery plan mapped to this repo |

Historical runbooks and audits are retained under [`technical/reference/`](./technical/reference/).

## Non-technical index

| # | Document | Summary |
|---|----------|---------|
| 01 | [Product overview](./non-technical/01-product-overview.md) | What DiQualia's website and admin system do, in plain words |
| 02 | [Website tour](./non-technical/02-website-tour.md) | Every public page, screen by screen |
| 03 | [Admin guide](./non-technical/03-admin-guide.md) | Logging in, editing content, blog posts, jobs, leads, users |
| 04 | [Applicant portal guide](./non-technical/04-applicant-portal-guide.md) | What job applicants see after they apply |
| 05 | [FAQ & glossary](./non-technical/05-faq-and-glossary.md) | Common questions and jargon translated |

> Screenshots referenced in the non-technical guides should be captured on the
> live site at handoff time and dropped into `non-technical/images/`. Placeholders
> are marked `_[screenshot: …]_` in the text.
