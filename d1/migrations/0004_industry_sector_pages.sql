-- Dedicated industry landing page fields on industry_sectors
ALTER TABLE "industry_sectors" ADD COLUMN "slug" TEXT;
ALTER TABLE "industry_sectors" ADD COLUMN "eyebrow" TEXT;
ALTER TABLE "industry_sectors" ADD COLUMN "headline" TEXT;
ALTER TABLE "industry_sectors" ADD COLUMN "body" TEXT;
ALTER TABLE "industry_sectors" ADD COLUMN "hero_image_url" TEXT;
ALTER TABLE "industry_sectors" ADD COLUMN "why_points" TEXT;
ALTER TABLE "industry_sectors" ADD COLUMN "case_study_refs" TEXT;

-- Backfill unique slugs for known seed names
UPDATE "industry_sectors" SET "slug" = 'construction-built-environment' WHERE "name" = 'Construction & Built Environment';
UPDATE "industry_sectors" SET "slug" = 'technical-services' WHERE "name" = 'Technical Services';
UPDATE "industry_sectors" SET "slug" = 'engineering-infrastructure' WHERE "name" = 'Engineering & Infrastructure';
UPDATE "industry_sectors" SET "slug" = 'real-estate' WHERE "name" = 'Real Estate';
UPDATE "industry_sectors" SET "slug" = 'industrial-manufacturing' WHERE "name" = 'Industrial & Manufacturing';
UPDATE "industry_sectors" SET "slug" = 'professional-services' WHERE "name" = 'Professional Services';
UPDATE "industry_sectors" SET "slug" = 'energy-utilities' WHERE "name" = 'Energy & Utilities';
UPDATE "industry_sectors" SET "slug" = 'logistics-supply-chain' WHERE "name" = 'Logistics & Supply Chain';
UPDATE "industry_sectors" SET "slug" = 'healthcare-services' WHERE "name" = 'Healthcare Services';
UPDATE "industry_sectors" SET "slug" = 'legal-compliance' WHERE "name" = 'Legal & Compliance';
UPDATE "industry_sectors" SET "slug" = 'financial-services' WHERE "name" = 'Financial Services';
UPDATE "industry_sectors" SET "slug" = 'saas-technology' WHERE "name" = 'SaaS & Technology';

-- Fallback for any custom rows added before this migration
UPDATE "industry_sectors" SET "slug" = 'sector-' || "id" WHERE "slug" IS NULL OR "slug" = '';

CREATE UNIQUE INDEX "industry_sectors_slug_key" ON "industry_sectors"("slug");
