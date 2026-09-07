# Website Tour

A screen-by-screen walk through the public site at `diqualia.com`. Every page
below is editable from the admin panel unless noted — see the
[Admin guide](./03-admin-guide.md) for how.

> _[screenshot: home page hero]_ — replace placeholders with real captures in
> `images/` at handoff.

## Shared elements (on every page)

- **Header** — the DiQualia logo (links home), the navigation menu, a
  call-to-action button, and a light/dark theme toggle. Menu items and the
  button are editable under **Site-wide → Nav Items** and **CTA**.
- **Footer** — taglines, contact details (phone, email, address), social links
  (LinkedIn, Facebook, Instagram), grouped link lists, and the copyright line.
  Editable under **Site-wide → Footer**.

## Home ( `/` )

The landing page. Sections, top to bottom:

1. **Hero** — an eyebrow line, a three-line headline, a short paragraph, two
   buttons, and three headline statistics.
2. **Marquee** — a scrolling strip of short phrases.
3. **Explore** — a heading block plus a grid of cards, each linking to another
   part of the site.
4. **Where next** — a closing prompt with a button.

Edit under **Home** in the admin sidebar (Hero, Marquee, Explore Header, Explore
Cards, Where Next).

## About ( `/about` )

Who DiQualia is.

1. **Hero** — eyebrow, headline, paragraph.
2. **Built for** — a heading plus a list of "who this is for" items.
3. **Where next** — closing prompt with two buttons.

Edit under **About**.

## Services ( `/services` )

What DiQualia offers.

1. **Intro** — eyebrow, headline, paragraph, and four statistics.
2. **Sections** — one block per service area. Each has a heading, an
   introduction, an optional rich-text overview, an optional list of sub-items
   (which can be grouped), and an optional call-to-action link.
3. **Closing call-to-action** — headline, paragraph, a button, and an email link.

Edit under **Services** (Intro Hero, Intro CTA, Sections & Items).

## How We Work ( `/process` )

DiQualia's working process.

1. **Hero** — eyebrow, three-line headline, paragraph.
2. **Steps** — a numbered list of process steps, each with a label, number,
   title, and description.
3. **Where next** — closing prompt.

Edit under **How We Work**.

## Industries ( `/industries` )

The sectors DiQualia serves.

1. **Hero** — eyebrow, two-line headline, paragraph.
2. **Sectors** — a description plus a set of sector tags. Each sector can
   optionally have its **own detail page** at `/industries/<sector-name>` with a
   hero, body copy, "why it matters" points, and case-study references. A
   sector's detail page only appears publicly when it is marked **visible**.
3. **Sidebar copy** and a **Where next** block.

Edit under **Industries** (Hero, Sectors copy, Sector tags, Where Next).

## Story ( `/story` )

DiQualia's origin and beliefs.

1. **Hero** — eyebrow, three-line headline, paragraph.
2. **Double experience** — two highlighted blocks (number, title, body) and a
   tagline.
3. **Manifesto** — a list of statements.

Edit under **Story**.

## Blog / Insights ( `/blog` )

1. **Index** — a list of published posts, newest first, each showing its cover
   image, title, excerpt, and estimated reading time. A "load more" control
   pages through older posts.
2. **Post page** ( `/blog/<post-name>` ) — the cover image, title, and the full
   article body, with a reading-progress bar.

**Only posts set to _Published_ appear here.** Drafts are invisible to the
public. Edit under **Blog → Posts**. See
[Admin guide → Add a blog post](./03-admin-guide.md#add-or-edit-a-blog-post).

## Careers ( `/careers` )

1. **Hero, Culture, Benefits** — editable marketing copy about working at
   DiQualia.
2. **Open roles** — a filterable list of job openings. Each links to a detail
   page at `/careers/<role-name>` with the full description, responsibilities,
   requirements, and an **Apply** button.
3. **Apply form** — a four-step wizard: Personal details → Education →
   Professional background → Other (skills, notice period, expected salary, CV
   upload, photo upload, declaration). Progress is saved as the applicant goes,
   so they can leave and come back.

On submit: the application is recorded, the CV and photo are stored, a portal
account is created for the applicant (with a one-time password emailed to them),
and your team gets a notification email.

Edit the marketing copy under **Careers** (Hero, Culture, Benefits, Apply
instructions). Manage the roles under **Careers → Job Openings**. Read
applications under **Careers → Applications**.

## Contact ( `/contact` )

1. **Hero** — eyebrow, two-line headline, paragraph.
2. **Email card** — a highlighted contact method.
3. **What to include** — a checklist to help visitors write a useful message.
4. **Expectation** — what happens after they send.
5. **The form** — name, email, message. On submit it is saved as a "lead" and
   emailed to your team.

Edit under **Contact** (Hero, Email Card, What to Include, Expectation). Read
submissions under **Contact → Submissions**.

## Privacy ( `/privacy` ) and Terms ( `/terms` )

Static legal pages. **Not editable from the admin panel** — changes need a
developer.

## Behind-the-scenes pages (not linked in the menu)

- `/sitemap.xml`, `/robots.txt` — for search engines. Maintained automatically.
- Social-share preview images — generated automatically.
