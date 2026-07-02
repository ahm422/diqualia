-- Add read status to leads
ALTER TABLE "leads" ADD COLUMN "read" BOOLEAN NOT NULL DEFAULT false;
