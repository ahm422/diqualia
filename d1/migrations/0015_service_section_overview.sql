-- Rich per-section overview (sanitised TipTap HTML) + optional CTA for /services blocks.
-- Additive only. No down-migration needed.

ALTER TABLE "service_sections" ADD COLUMN "overview_html" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "cta_label" TEXT;
ALTER TABLE "service_sections" ADD COLUMN "cta_href" TEXT;
