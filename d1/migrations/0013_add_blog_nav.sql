-- Add the public "Blog" entry to header + footer navigation.
-- The /blog pages have existed since the blog feature landed, but databases
-- seeded before that (every real environment) never got the nav row, so the
-- section is unreachable. Idempotent insert; matches prisma/seed-cms.ts.
-- Additive only. No down-migration needed.

INSERT INTO "nav_items" ("href", "label", "order", "visible")
SELECT '/blog', 'Blog', 5, 1
WHERE NOT EXISTS (SELECT 1 FROM "nav_items" WHERE "href" = '/blog');

INSERT INTO "footer_nav_items" ("href", "label", "group", "order")
SELECT '/blog', 'Blog', 'primary', 5
WHERE NOT EXISTS (SELECT 1 FROM "footer_nav_items" WHERE "href" = '/blog');
