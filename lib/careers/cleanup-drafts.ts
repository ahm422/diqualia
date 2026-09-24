import { DRAFT_IN_PROGRESS } from "@/lib/careers/draft";
import type { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Stale in-progress draft cleanup (issue #102).
 *
 * Retention policy: a career-application draft with status = 'in_progress'
 * and updatedAt older than 30 days, with no matching JobApplication for its
 * (jobOpeningId, email), is considered abandoned and hard-deleted — the
 * parent row plus the four child step tables (cascade via
 * ON DELETE CASCADE, see d1/migrations/0009_career_application_drafts.sql)
 * and any uploaded resume/photo objects in R2.
 *
 * Completed drafts (status = 'completed') are never touched: their
 * resume/photo R2 keys are also referenced by the resulting JobApplication
 * row, so deleting them would break a live application's attachments.
 */

export type CleanupStorageClient = {
  deleteObject(opts: { key: string }): Promise<void>;
};

export type CleanupSummary = {
  scanned: number;
  deleted: number;
  r2ObjectsDeleted: number;
  skippedLinked: number;
  errors: Array<{ token: string; error: string }>;
};

async function deleteR2Keys(storage: CleanupStorageClient, keys: string[]): Promise<number> {
  let deleted = 0;
  for (const key of keys) {
    try {
      await storage.deleteObject({ key });
      deleted += 1;
    } catch {
      // best-effort: an already-missing/failed R2 delete shouldn't block the DB cleanup
    }
  }
  return deleted;
}

export async function cleanupStaleDrafts(
  prisma: PrismaClient,
  storage: CleanupStorageClient,
  { olderThanDays = 30, dryRun = false }: { olderThanDays?: number; dryRun?: boolean } = {},
): Promise<CleanupSummary> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const candidates = await prisma.careerApplicationDraft.findMany({
    where: { status: DRAFT_IN_PROGRESS, updatedAt: { lte: cutoff } },
    include: { personal: true, other: true },
  });

  const summary: CleanupSummary = {
    scanned: candidates.length,
    deleted: 0,
    r2ObjectsDeleted: 0,
    skippedLinked: 0,
    errors: [],
  };

  for (const draft of candidates) {
    try {
      // Defensive check: skip a draft whose applicant already has a
      // JobApplication for this opening (e.g. applied through the
      // non-draft flow after abandoning this draft) rather than trusting
      // status alone.
      if (draft.personal?.email) {
        const existing = await prisma.jobApplication.findFirst({
          where: { jobOpeningId: draft.jobOpeningId, email: draft.personal.email },
          select: { id: true },
        });
        if (existing) {
          summary.skippedLinked += 1;
          continue;
        }
      }

      const keys = [draft.other?.resumeKey, draft.other?.photoKey].filter(
        (key): key is string => Boolean(key),
      );

      if (dryRun) {
        summary.deleted += 1;
        summary.r2ObjectsDeleted += keys.length;
        continue;
      }

      summary.r2ObjectsDeleted += await deleteR2Keys(storage, keys);
      await prisma.careerApplicationDraft.delete({ where: { token: draft.token } });
      summary.deleted += 1;
    } catch (err) {
      summary.errors.push({
        token: draft.token,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return summary;
}
