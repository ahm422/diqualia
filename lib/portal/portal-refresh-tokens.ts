import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { NextResponse } from "next/server";

import type { PrismaClient } from "@/lib/generated/prisma/client";

export const PORTAL_REFRESH_COOKIE_NAME = "dq_portal_refresh";

const REFRESH_TTL_MS = 60 * 60 * 24 * 7; // 7 days

const BASE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

function cookieSecure(): boolean {
  return process.env.COOKIE_SECURE === "true"
    ? true
    : process.env.COOKIE_SECURE === "false"
      ? false
      : process.env.NODE_ENV === "production";
}

export function setPortalRefreshCookie(res: NextResponse, token: string, expiresAt: Date) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  res.cookies.set(PORTAL_REFRESH_COOKIE_NAME, token, {
    ...BASE_OPTS,
    secure: cookieSecure(),
    maxAge,
  });
}

export function clearPortalRefreshCookie(res: NextResponse) {
  res.cookies.set(PORTAL_REFRESH_COOKIE_NAME, "", { ...BASE_OPTS, maxAge: 0 });
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function generateRawToken(): string {
  return `${randomBytes(32).toString("base64url")}.${randomBytes(16).toString("base64url")}`;
}

export async function issuePortalRefreshToken(
  prisma: PrismaClient,
  applicantUserId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  await prisma.applicantRefreshToken.create({
    data: { applicantUserId, tokenHash: hashToken(token), expiresAt },
  });
  return { token, expiresAt };
}

export async function rotatePortalRefreshToken(prisma: PrismaClient, rawToken: string) {
  const row = await prisma.applicantRefreshToken.findFirst({
    where: { tokenHash: hashToken(rawToken), revokedAt: null, expiresAt: { gt: new Date() } },
    include: { applicantUser: true },
  });
  if (!row) return null;
  await prisma.applicantRefreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  const next = await issuePortalRefreshToken(prisma, row.applicantUserId);
  return { applicantUser: row.applicantUser, ...next };
}

export async function revokePortalRefreshToken(
  prisma: PrismaClient,
  rawToken: string,
): Promise<boolean> {
  const row = await prisma.applicantRefreshToken.findFirst({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
  });
  if (!row) return false;
  await prisma.applicantRefreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  return true;
}

/** Revoke every live refresh token for an applicant (e.g. after a password change). */
export async function revokeAllPortalRefreshTokens(
  prisma: PrismaClient,
  applicantUserId: string,
): Promise<void> {
  await prisma.applicantRefreshToken.updateMany({
    where: { applicantUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
