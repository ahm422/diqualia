-- Index to support the stale draft cleanup job (issue #102).
--
-- Retention policy: a career_application_drafts row with status =
-- 'in_progress' and updated_at older than 30 days (and no matching
-- job_applications row for its (job_opening_id, email)) is considered
-- abandoned and hard-deleted, cascading to its 4 child step tables. Rows
-- with status = 'completed' are never touched by the job. See
-- lib/careers/cleanup-drafts.ts.

CREATE INDEX "career_application_drafts_status_updated_at_idx"
    ON "career_application_drafts" ("status", "updated_at");
