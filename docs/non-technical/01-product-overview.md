# Product Overview

## What this is

This is the **DiQualia website** and the **control panel** behind it.

There are three parts:

1. **The public website** (`diqualia.com`) — the marketing site your visitors
   see: what DiQualia does, how it works, the industries it serves, a blog, a
   careers page, and a contact form.
2. **The admin panel** (`diqualia.com/admin`) — a private, password-protected
   area where your team edits almost every word and image on the public site,
   publishes blog posts, posts job openings, and reads the enquiries and job
   applications that come in.
3. **The applicant portal** (`diqualia.com/portal`) — a small private area for
   people who have applied for a job. After someone applies, an account is
   created for them automatically so they can log back in and check the status
   of their application.

## What you can do without a developer

Nearly all day-to-day content is editable from the admin panel:

- Every headline, paragraph, button, and statistic on the Home, About, Services,
  How We Work, Industries, Story, and Contact pages.
- The site navigation menu and the footer.
- Blog posts — write, save as draft, publish, unpublish, delete.
- Job openings — add, edit, reorder, hide.
- Reading and managing incoming contact enquiries ("leads").
- Reading job applications, changing their status, and downloading CVs.
- Adding and removing admin users, and controlling what each user is allowed to
  do.

## What needs a developer

- Changing the **design / layout** (colours, spacing, page structure).
- Adding a **new type of page** or a new section that doesn't already exist.
- Anything to do with **hosting, the domain, email delivery, or security**.
- Connecting the site to outside tools (a CRM, a newsletter platform, analytics).

## How content reaches the website

When you save a change in the admin panel, the public website updates
**immediately** — there is no separate "publish the whole site" step. (Blog posts
are the exception: a post stays invisible until you explicitly set it to
*Published*.)

## Where the data lives

Everything — page content, blog posts, job openings, enquiries, applications,
uploaded images and CVs — is stored on **Cloudflare**, the same service that
hosts the website. Nothing is on a personal laptop or a third-party spreadsheet.
Emails (enquiry notifications, applicant confirmations) are also sent through
Cloudflare from `noreply@diqualia.com`.

## The people who use it

| Person | Where they log in | What they see |
|---|---|---|
| Your content team | `/admin` | The pages/sections their role allows |
| Your HR / recruiting | `/admin` | Job openings + applications (an "HR" role exists for exactly this) |
| A site administrator | `/admin` | Everything, including managing other users |
| A job applicant | `/portal` | Only their own application(s) and status |
| A website visitor | the public site | The public pages only |

## Next documents

- [Website tour](./02-website-tour.md) — every public page explained
- [Admin guide](./03-admin-guide.md) — how to do the common tasks
- [Applicant portal guide](./04-applicant-portal-guide.md)
- [FAQ & glossary](./05-faq-and-glossary.md)
