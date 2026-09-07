# Applicant Portal Guide

The applicant portal at **`diqualia.com/portal`** is a small private area for
people who have applied for a job at DiQualia. It is completely separate from the
staff admin panel.

> _[screenshot: portal login]_ and _[screenshot: portal dashboard]_ — capture at
> handoff into `images/`.

## For the applicant

### Getting an account

You do not sign up. When you submit a job application on `diqualia.com/careers`,
an account is created for you automatically. You receive an email containing:

- confirmation that your application was received, and
- a **one-time password** for the portal.

### First login

1. Go to `diqualia.com/portal`.
2. Enter the email you applied with and the one-time password from the email.
3. You are asked to **set a new password**. Choose something only you know; a
   strength meter guides you.
4. You then land on your dashboard.

### What you can see

- **Your application(s)** — one card per role you applied for.
- **Status** — where your application currently stands, shown as a progress
  stepper (for example: received → under review → shortlisted → decision).
- **Application detail** — click a card to see the details you submitted, and to
  download the CV and photo you attached.

You can only ever see **your own** applications. You cannot see other applicants,
job-opening admin, or any staff content.

### Forgot your password

There is no self-service reset yet. Contact DiQualia (the recruiter you have been
speaking with, or the address on the careers page) and they will help.

## For DiQualia staff

- Applicant accounts live separately from staff accounts and use a different
  login page (`/portal`, not `/admin`).
- An account is created the moment an application is submitted, using the
  applicant's email address. If the same person applies for a second role with
  the same email, it reuses the same account.
- The status an applicant sees is driven by the **Status** field you set on the
  application in **Admin → Careers → Applications**. Keeping that field current
  is what keeps the applicant informed.
- Staff cannot log into the portal with an admin account, and applicants cannot
  log into the admin panel — the two systems share nothing.
- If an applicant needs a password reset, this currently requires a developer
  (there is no admin screen for it yet).
