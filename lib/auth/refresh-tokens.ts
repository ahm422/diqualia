import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { NextResponse } from "next/server";

import type { PrismaClient } from "@/lib/generated/prisma/client";

export const REFRESH_COOKIE_NAME = "dq_admin_refresh";

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

export function setRefreshCookie(res: NextResponse, token: string, expiresAt: Date) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  res.cookies.set(REFRESH_COOKIE_NAME, token, {
    ...BASE_OPTS,
    secure: cookieSecure(),
    maxAge,
  });
}

export function clearRefreshCookie(res: NextResponse) {
  res.cookies.set(REFRESH_COOKIE_NAME, "", { ...BASE_OPTS, maxAge: 0 });
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function generateRawToken(): string {
  return `${randomBytes(32).toString("base64url")}.${randomBytes(16).toString("base64url")}`;
}

export async function issueRefreshToken(
  prisma: PrismaClient,
  adminUserId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

  await prisma.refreshToken.create({
    data: {
      adminUserId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

async function findValidToken(prisma: PrismaClient, rawToken: string) {
  const row = await prisma.refreshToken.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { adminUser: true },
  });
  return row;
}

export async function rotateRefreshToken(prisma: PrismaClient, rawToken: string) {
  const row = await findValidToken(prisma, rawToken);
  if (!row) return null;

  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  const next = await issueRefreshToken(prisma, row.adminUserId);
  return { adminUser: row.adminUser, ...next };
}

export async function revokeRefreshToken(prisma: PrismaClient, rawToken: string): Promise<boolean> {
  const row = await prisma.refreshToken.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
    },
  });
  if (!row) return false;

  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  return true;
}
