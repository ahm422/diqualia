import type { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "dq_admin_token";

const BASE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    ...BASE_OPTS,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { ...BASE_OPTS, maxAge: 0 });
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}
