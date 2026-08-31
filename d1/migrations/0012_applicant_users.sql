-- Applicant portal accounts + refresh tokens (issue #108, part 07).
-- Additive only — new tables + one nullable column. No down-migration needed.

CREATE TABLE "applicant_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "must_change_password" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" DATETIME
);

CREATE UNIQUE INDEX "applicant_users_email_key" ON "applicant_users" ("email");

CREATE TABLE "applicant_refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicant_user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("applicant_user_id") REFERENCES "applicant_users"("id") ON DELETE CASCADE
);

CREATE INDEX "applicant_refresh_tokens_applicant_user_id_idx" ON "applicant_refresh_tokens" ("applicant_user_id");
CREATE INDEX "applicant_refresh_tokens_token_hash_idx" ON "applicant_refresh_tokens" ("token_hash");

ALTER TABLE "job_applications" ADD COLUMN "applicant_user_id" TEXT;
CREATE INDEX "job_applications_applicant_user_id_idx" ON "job_applications" ("applicant_user_id");
