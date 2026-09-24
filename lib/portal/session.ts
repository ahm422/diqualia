import type { NextRequest, NextResponse } from "next/server";

export const PORTAL_COOKIE_NAME = "dq_portal_token";

export type PortalSession = {
  id: string;
  email: string;
  name: string | null;
  mustChangePassword: boolean;
};

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

export function setPortalCookie(res: NextResponse, token: string) {
  res.cookies.set(PORTAL_COOKIE_NAME, token, {
    ...BASE_OPTS,
    secure: cookieSecure(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearPortalCookie(res: NextResponse) {
  res.cookies.set(PORTAL_COOKIE_NAME, "", { ...BASE_OPTS, maxAge: 0 });
}

export function getPortalTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(PORTAL_COOKIE_NAME)?.value ?? null;
}
