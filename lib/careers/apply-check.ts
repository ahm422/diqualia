import type { DbClient } from "./apply-shared";

/**
 * Per-field duplicate check for one opening. Booleans only — the caller has
 * already normalized `email` (trim + lowercase) and `cnic` (13 bare digits);
 * pass `null` for a field that was absent or invalid. Never echoes PII.
 *
 * Kept in its own module (no `next/server` / prisma-client imports) so it can be
 * unit-tested with a hand-rolled fake Prisma, matching `cleanup-drafts.ts`.
 */
export async function lookupExistingApplication({
  prisma,
  jobOpeningId,
  email,
  cnic,
}: {
  prisma: Pick<DbClient, "jobApplication">;
  jobOpeningId: number;
  email: string | null;
  cnic: string | null;
}): Promise<{ email: boolean; cnic: boolean }> {
  if (!Number.isInteger(jobOpeningId) || jobOpeningId <= 0 || (!email && !cnic)) {
    return { email: false, cnic: false };
  }
  const [emailHit, cnicHit] = await Promise.all([
    email
      ? prisma.jobApplication.findFirst({
          where: { jobOpeningId, email },
          select: { id: true },
        })
      : Promise.resolve(null),
    cnic
      ? prisma.jobApplication.findFirst({
          where: { jobOpeningId, cnic },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);
  return { email: emailHit != null, cnic: cnicHit != null };
}
