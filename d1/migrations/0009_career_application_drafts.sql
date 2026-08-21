-- Career apply drafts (wizard) + one-per-job uniqueness on job_applications

CREATE TABLE "career_application_drafts" (
    "token" TEXT NOT NULL PRIMARY KEY,
    "job_opening_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("job_opening_id") REFERENCES "job_openings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "career_application_draft_personal" (
    "draft_token" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "father_or_husband_name" TEXT,
    "date_of_birth" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "marital_status" TEXT,
    "nationality" TEXT NOT NULL,
    "cnic" TEXT,
    "current_address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    FOREIGN KEY ("draft_token") REFERENCES "career_application_drafts" ("token") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "career_application_draft_education" (
    "draft_token" TEXT NOT NULL PRIMARY KEY,
    "highest_qualification" TEXT NOT NULL,
    "field_of_study" TEXT,
    "institution_name" TEXT,
    "year_of_completion" INTEGER,
    FOREIGN KEY ("draft_token") REFERENCES "career_application_drafts" ("token") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "career_application_draft_professional" (
    "draft_token" TEXT NOT NULL PRIMARY KEY,
    "years_of_experience" INTEGER NOT NULL,
    "current_employer" TEXT,
    "current_job_title" TEXT,
    "cover_note" TEXT,
    FOREIGN KEY ("draft_token") REFERENCES "career_application_drafts" ("token") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "career_application_draft_other" (
    "draft_token" TEXT NOT NULL PRIMARY KEY,
    "key_skills" TEXT NOT NULL,
    "notice_period_days" INTEGER NOT NULL,
    "expected_salary" INTEGER NOT NULL,
    "available_from" TEXT NOT NULL,
    "resume_key" TEXT,
    "photo_key" TEXT,
    "declaration_accepted" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("draft_token") REFERENCES "career_application_drafts" ("token") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "job_applications_opening_email_key"
    ON "job_applications" ("job_opening_id", "email");
CREATE UNIQUE INDEX "job_applications_opening_cnic_key"
    ON "job_applications" ("job_opening_id", "cnic");
