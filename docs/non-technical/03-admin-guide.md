# Admin Guide

How to do the common jobs in the admin panel at **`diqualia.com/admin`**.

> _[screenshot: admin login]_ and _[screenshot: admin sidebar]_ — capture at
> handoff into `images/`.

## Logging in

1. Go to `diqualia.com/admin`.
2. Enter your email and password. (Your account is created for you by an
   administrator — you do not self-register.)
3. You land on the admin dashboard. The **left sidebar** is your menu; it only
   shows the sections your role is allowed to use.
4. To sign out, use the account control in the sidebar.

If you forget your password, an administrator resets it for you (there is no
self-service "forgot password" yet).

## How editing works (the pattern)

Every content screen works the same way:

1. Pick a section from the sidebar (e.g. **Home → Hero**).
2. Change the fields.
3. Click **Save**.
4. The public website updates **immediately**. Open the page in another tab to
   check. Some screens have a "Preview" link that opens the live page.

Notes:

- If **Save** is greyed out, you have not changed anything yet, or your role
  doesn't allow editing that section (you can view but not save).
- Lists (menu items, process steps, blog posts, job openings, etc.) let you
  **add a row**, **edit a row inline**, **reorder**, and **delete**.
- Some fields are **rich text** (bold, lists, links, headings, images, tables) —
  a small toolbar appears above them.
- **Images:** use the image picker on a field. Uploaded images are stored on
  Cloudflare and given a permanent web address automatically. Accepted types:
  JPG, PNG, WebP, SVG, up to 5 MB.

## Edit page content

The sidebar groups editable content by page:

| Sidebar group | Controls the public page |
|---|---|
| **Home** | `/` — Hero, Marquee, Explore header, Explore cards, Where Next |
| **About** | `/about` — Hero, Built-For header, Built-For items, Where Next |
| **Services** | `/services` — Intro Hero, Intro CTA, Sections & Items |
| **How We Work** | `/process` — Hero, Steps, Where Next |
| **Industries** | `/industries` — Hero, Sectors copy, Sector tags, Where Next |
| **Story** | `/story` — Hero, DX cards, DX tagline, Manifesto |
| **Contact** | `/contact` — Hero, Email Card, What to Include, Expectation |
| **Careers** | `/careers` marketing copy — Hero, Culture, Benefits, Apply instructions |
| **Site-wide** | Site settings, navigation menu, footer |

Pick the sub-item, change the fields, **Save**.

### Industry sector detail pages

Under **Industries → Sector tags**, each sector can be given its own detail page
(hero, body, "why" points). A sector's detail page is **only public when the
sector is marked visible**. Toggle visibility there.

## Add or edit a blog post

1. Sidebar → **Blog → Posts**. You see the list of all posts with their status
   (Draft / Published).
2. Click **New post** (or an existing post to edit it).
3. Fill in:
   - **Title**
   - **Slug** — the last part of the web address (`/blog/<slug>`). Keep it short,
     lowercase, words-separated-by-hyphens. It must be unique. Changing it after
     publishing changes the post's URL.
   - **Excerpt** — the short summary shown on the blog index.
   - **Cover image** — shown on the index and at the top of the post.
   - **Body** — the full article, using the rich-text editor (headings, bold,
     lists, links, images, tables).
4. **Status:**
   - **Draft** — saved but invisible to the public. Use this while writing.
   - **Published** — live on `/blog`. The publish date is set the first time you
     publish. Publishing may require a specific permission on your role; if the
     option is missing, ask an administrator.
5. **Save.**

To take a post down, set it back to **Draft** and save. To remove it entirely,
use **Delete** (this cannot be undone).

## Manage job openings

1. Sidebar → **Careers → Job Openings**.
2. **New opening** or click an existing one.
3. Fill in: title, department, location, type, description, responsibilities,
   requirements, optional nice-to-haves, seniority, salary range, remote policy,
   team note.
4. **Order** controls the position in the list on `/careers`.
5. **Visible** — untick to hide a role without deleting it.
6. **Save.**

Each opening gets a public page at `/careers/<slug>` with an **Apply** button.

## Read and manage contact enquiries ("leads")

1. Sidebar → **Contact → Submissions**.
2. You see every enquiry from the contact form: name, email, message, date, and
   whether it has been read.
3. Click one to read it. Mark it **read / unread**, or **delete** it.
4. Your team also gets an **email** for each new enquiry (to the configured
   notification address), with the sender's address as reply-to — so you can
   reply straight from your inbox.

> The Submissions list is the reliable record. If an email notification doesn't
> arrive, the enquiry is still saved here.

## Read job applications

1. Sidebar → **Careers → Applications**.
2. You see every submitted application. Filter by status; sort by date.
3. Click one for the full detail: personal info, education, professional
   background, skills, salary expectation, etc.
4. **Status** — change it as the application moves through your process (e.g.
   new → reviewing → shortlisted → rejected). Changing status may require the
   "manage applications" permission.
5. **CV, photo, and CSV export** — downloading these, and seeing an applicant's
   full CNIC (it is masked by default), requires the **applicant PII**
   permission on your role. This is deliberate — it keeps sensitive personal
   data limited to the people who need it.
6. **Export** — the CSV export button downloads all applications as a
   spreadsheet (PII permission required).

Applicants can also log in to the [applicant portal](./04-applicant-portal-guide.md)
to see their own status.

## Manage admin users

Sidebar → **Site-wide → Users** (needs the "manage users" permission).

1. **New user** — enter their name, email, a temporary password, and assign a
   **role**. Send them the email + temporary password; they change it after
   logging in.
2. **Edit** — change name or role.
3. **Delete** — needs the "delete users" permission. You cannot delete the last
   administrator account.

## Manage roles

Sidebar → **Site-wide → Roles** (needs the "manage roles" permission).

- **Built-in roles** (cannot be changed): **Super admin** (everything),
  **Admin** (everything except deleting users), **Editor** (content only),
  **HR** (job openings + applications + contact enquiries, no content or user
  management), **Employee** (login only, no access — a placeholder).
- **Custom roles** — click **New role**, name it, and tick exactly the
  permissions it should have. Permissions are grouped: **CMS** (page content &
  blog), **Careers** (openings, applications, applicant PII), **Contact**
  (enquiries), **Users & Roles**.
- Assign roles to people on the **Users** screen.

### What each permission unlocks

| Permission | Lets the user… |
|---|---|
| View CMS content | Open every content editor, read-only |
| Edit CMS content | Change page content and blog posts, upload images |
| Publish content | Move a blog post from Draft to Published |
| Manage job openings | Add/edit/reorder/remove roles on `/careers` |
| View job applications | Open the Applications inbox (CNIC masked) |
| Manage job applications | Change an application's status/notes |
| Access applicant PII | See full CNIC, download CV / photo / CSV |
| View contact submissions | Open the enquiries inbox |
| Manage contact submissions | Mark read/unread, delete enquiries |
| Manage admin users | Create/edit users, assign roles |
| Delete admin users | Permanently remove a user account |
| Manage roles | Create/edit/delete custom roles |

## Good habits

- Change your temporary password the first time you log in.
- Give people the **narrowest role** that lets them do their job (use HR for
  recruiters, Editor for writers).
- Before deleting anything (a blog post, a job opening, a user), remember it
  cannot be undone from the panel.
- After a big content change, open the public page to confirm it looks right.
