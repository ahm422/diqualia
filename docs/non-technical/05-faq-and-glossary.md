# FAQ & Glossary

## Frequently asked questions

**I changed some text and clicked Save. When does the website update?**
Immediately. Refresh the public page in another tab. The only exception is blog
posts, which stay hidden until you set them to *Published*.

**I edited a blog post but it's not on the website.**
Check its status is **Published**, not **Draft**. Drafts are invisible to the
public on purpose.

**The Save button is greyed out.**
Either you haven't changed anything yet, or your role can view that screen but
not edit it. Ask an administrator to check your role.

**A contact enquiry email didn't arrive.**
The enquiry is still saved. Open **Admin → Contact → Submissions** — that list is
the reliable record. Email notifications are a convenience on top of it.

**Can I undo a delete?**
Not from the admin panel. Deleting a blog post, job opening, or user is
permanent. A developer can sometimes recover data from a backup, but don't rely
on it.

**Someone applied for a job — where do I see it?**
**Admin → Careers → Applications**. To download their CV or see their full CNIC
you need the "applicant PII" permission on your role.

**How does an applicant check their status?**
They log in at `diqualia.com/portal` with the account created when they applied.
What they see is driven by the **Status** field you set on their application.

**How do I add a new team member to the admin panel?**
**Admin → Site-wide → Users → New user**. Assign the narrowest role that fits
(e.g. HR for recruiters, Editor for writers). You need the "manage users"
permission.

**Can I change the page design / colours / layout?**
No — that needs a developer. The admin panel changes *content*, not *design*.

**Can I edit the Privacy or Terms page?**
Not from the admin panel. Those are fixed pages; changes need a developer.

**Is there a way to schedule a blog post to publish later?**
Not currently. Save it as a draft and publish it manually when ready.

**Where is everything stored?**
On Cloudflare — the same platform that runs the website. Page content, blog
posts, job openings, enquiries, applications, and uploaded files (images, CVs)
all live there.

---

## Glossary — jargon translated

| Term | Plain meaning |
|---|---|
| **Admin panel / CMS** | The private area at `/admin` where you edit the site. CMS = "content management system". |
| **Public site / front end** | The website your visitors see at `diqualia.com`. |
| **Lead / submission** | A message someone sent through the contact form. |
| **Draft / Published** | A blog post's state. Draft = only you can see it. Published = live for everyone. |
| **Slug** | The readable last part of a web address. For `diqualia.com/blog/how-we-research`, the slug is `how-we-research`. |
| **Hero** | The large banner section at the top of a page (headline + intro + buttons). |
| **Eyebrow** | The small line of text sitting just above a headline. |
| **CTA** | "Call to action" — a button or link prompting the visitor to do something ("Book a call"). |
| **Rich text** | A text field where you can format with bold, lists, links, headings, images, and tables. |
| **Role** | A named bundle of permissions assigned to an admin user (e.g. Editor, HR). |
| **Permission** | A single thing a role is allowed to do (e.g. "Publish content"). |
| **PII** | "Personally identifiable information" — sensitive personal data such as an applicant's full CNIC, CV, and photo. Access is restricted. |
| **CNIC** | Pakistani national ID number, collected on job applications. Shown masked unless you have the PII permission. |
| **Applicant portal** | The separate private area at `/portal` where job applicants track their own application. |
| **Cloudflare** | The company that hosts the website and stores its data and files, and sends its emails. |
| **Domain / DNS** | `diqualia.com` itself, and the settings that point it at the website. |
| **Deploy** | Publishing a new version of the *software* (done by a developer). Different from saving *content* (done by you, any time). |
| **Cron / scheduled job** | An automatic task that runs on a timer. Here, one runs nightly to clean up abandoned half-finished job applications. |
| **Sitemap / robots.txt** | Files that help search engines find and index the site. Maintained automatically. |

---

## Handoff extras

- **Demo video:** _[link to the recorded walkthrough — add at handoff]_
- **Live handoff call recording:** _[link — add at handoff]_
- **Support contact:** _[agency support email / terms — add at handoff]_
