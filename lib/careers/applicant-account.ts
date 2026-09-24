import "server-only";

import { randomBytes } from "node:crypto";

import { hashPassword } from "@/lib/auth/password";
import type { PrismaClient } from "@/lib/generated/prisma/client";

/** URL-safe, ~16-char single-use password. Never logged. */
function generatePassword(): string {
  return randomBytes(12).toString("base64url");
}

/**
 * Upsert the portal account for an applicant email. Returns the account id and,
 * only when the account was just created, the plain-text single-use password to
 * email (mustChangePassword is set so it's replaced on first sign-in).
 */
export async function ensureApplicantAccount(
  prisma: PrismaClient,
  rawEmail: string,
): Promise<{ applicantUserId: string; generatedPassword: string | null }> {
  const email = rawEmail.trim().toLowerCase();

  const existing = await prisma.applicantUser.findUnique({ where: { email } });
  if (existing) {
    return { applicantUserId: existing.id, generatedPassword: null };
  }

  const generatedPassword = generatePassword();
  try {
    const created = await prisma.applicantUser.create({
      data: {
        email,
        passwordHash: await hashPassword(generatedPassword),
        mustChangePassword: true,
      },
    });
    return { applicantUserId: created.id, generatedPassword };
  } catch {
    // Lost a race — the account now exists; fall back to it without a password.
    const row = await prisma.applicantUser.findUnique({ where: { email } });
    if (row) return { applicantUserId: row.id, generatedPassword: null };
    throw new Error("ensureApplicantAccount: could not create or load account");
  }
}
