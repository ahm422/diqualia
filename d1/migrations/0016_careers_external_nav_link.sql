-- Point the "Careers" nav link at the external careers site instead of the
-- in-app /careers pages. Updates existing rows (idempotent by label match);
-- matches prisma/seed-cms.ts.

UPDATE "nav_items"
SET "href" = 'https://career.diqualia.com'
WHERE "label" = 'Careers' AND "href" != 'https://career.diqualia.com';

UPDATE "footer_nav_items"
SET "href" = 'https://career.diqualia.com'
WHERE "label" = 'Careers' AND "href" != 'https://career.diqualia.com';
