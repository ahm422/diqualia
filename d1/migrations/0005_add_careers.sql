-- Careers CMS: singleton page, job openings, applications
CREATE TABLE "career_page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "culture_eyebrow" TEXT NOT NULL,
    "culture_headline" TEXT NOT NULL,
    "culture_body" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "apply_eyebrow" TEXT NOT NULL,
    "apply_headline" TEXT NOT NULL,
    "apply_body" TEXT NOT NULL
);

CREATE TABLE "job_openings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "visible" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "job_openings_slug_key" ON "job_openings"("slug");

CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "job_opening_id" INTEGER,
    "job_title" TEXT NOT NULL,
    "cover_note" TEXT,
    "resume_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("job_opening_id") REFERENCES "job_openings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "job_applications_job_opening_id_idx" ON "job_applications"("job_opening_id");
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

INSERT INTO "career_page" (
    "id",
    "eyebrow",
    "headline_line1",
    "headline_line2",
    "body",
    "culture_eyebrow",
    "culture_headline",
    "culture_body",
    "benefits",
    "apply_eyebrow",
    "apply_headline",
    "apply_body"
) VALUES (
    1,
    'Careers',
    'Build intelligence.',
    'Join the unit.',
    'DiQualia is a small research unit. We hire people who like hard problems, clean writing, and markets that do not fit a template.',
    'Culture',
    'A unit, not a factory.',
    'We work in small teams, share the research, and ship intelligence that sales and leadership can actually use. No theatre. No filler decks.',
    '["Remote-first with overlap hours","Deep-work calendar by default","Original research, not recycled reports","Direct access to founders and clients","Clear ownership of your workstream"]',
    'How to apply',
    'Send a note. Attach a resume.',
    'PDF, DOC, or DOCX up to 5 MB. Include a short cover note with the niche you know, a piece of work you are proud of, and why this role. We reply with next steps.'
);

INSERT INTO "job_openings" (
    "slug", "title", "department", "location", "type", "description", "requirements", "order", "visible"
)
SELECT
    'research-analyst',
    'Research Analyst',
    'Intelligence',
    'Remote',
    'Full-time',
    'Map niche B2B markets, interview buyers, and turn findings into briefs that move pipeline. You will own a vertical, keep a living account of competitors and buying committees, and write for operators — not for slide theatre.',
    '["2+ years in research, strategy, or B2B marketing","Comfort with qualitative interviews and desk research","Clear, concise writing","Curiosity about unsexy, high-consideration markets"]',
    0,
    1
WHERE NOT EXISTS (SELECT 1 FROM "job_openings" WHERE "slug" = 'research-analyst');

INSERT INTO "job_openings" (
    "slug", "title", "department", "location", "type", "description", "requirements", "order", "visible"
)
SELECT
    'strategy-associate',
    'Strategy Associate',
    'Strategy',
    'Remote',
    'Full-time',
    'Translate research into positioning, messaging, and go-to-market sequences for niche operators. You will sit between intelligence and delivery — tightening briefs, pressure-testing offers, and helping clients act.',
    '["1–3 years in consulting, product marketing, or operator strategy","Ability to turn messy inputs into a sequenced plan","Strong written communication","Comfort working across research and client delivery"]',
    1,
    1
WHERE NOT EXISTS (SELECT 1 FROM "job_openings" WHERE "slug" = 'strategy-associate');

INSERT INTO "nav_items" ("href", "label", "order", "visible")
SELECT '/careers', 'Careers', 6, 1
WHERE NOT EXISTS (SELECT 1 FROM "nav_items" WHERE "href" = '/careers');

INSERT INTO "footer_nav_items" ("href", "label", "group", "order")
SELECT '/careers', 'Careers', 'primary', 6
WHERE NOT EXISTS (SELECT 1 FROM "footer_nav_items" WHERE "href" = '/careers');
