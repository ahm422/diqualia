-- About "Built For" section header (eyebrow + two-line headline).
-- Additive only. Seed matches the previous hardcoded copy on /about#built-for.

CREATE TABLE "about_built_for_section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "eyebrow" TEXT NOT NULL,
    "headline_line1" TEXT NOT NULL,
    "headline_line2" TEXT NOT NULL
);

INSERT INTO "about_built_for_section" ("id", "eyebrow", "headline_line1", "headline_line2")
SELECT 1, 'What we''re built for', 'Intelligence that compounds —', 'not tactics that expire.'
WHERE NOT EXISTS (SELECT 1 FROM "about_built_for_section" WHERE "id" = 1);
