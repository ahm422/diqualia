-- Career application PII / hiring-packet fields + applications.pii permission
-- Fixed UUIDs must match lib/auth/rbac-ids.ts

ALTER TABLE "job_applications" ADD COLUMN "father_or_husband_name" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "date_of_birth" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "gender" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "marital_status" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "cnic" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "nationality" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "current_address" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "city" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "highest_qualification" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "field_of_study" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "institution_name" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "year_of_completion" INTEGER;
ALTER TABLE "job_applications" ADD COLUMN "years_of_experience" INTEGER;
ALTER TABLE "job_applications" ADD COLUMN "current_employer" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "current_job_title" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "key_skills" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "notice_period_days" INTEGER;
ALTER TABLE "job_applications" ADD COLUMN "expected_salary" INTEGER;
ALTER TABLE "job_applications" ADD COLUMN "available_from" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "photo_key" TEXT;
ALTER TABLE "job_applications" ADD COLUMN "declaration_accepted" INTEGER NOT NULL DEFAULT 0;

INSERT INTO "permissions" ("id", "key") VALUES
    ('11111111-1111-4111-8111-111111111008', 'applications.pii');

INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
    ('22222222-2222-4222-8222-222222222001', '11111111-1111-4111-8111-111111111008'),
    ('22222222-2222-4222-8222-222222222002', '11111111-1111-4111-8111-111111111008');
