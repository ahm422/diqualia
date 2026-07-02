import { NextResponse, type NextRequest } from "next/server";

import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  revokeRefreshToken,
} from "@/lib/auth/refresh-tokens";
import { clearSessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const rawToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (rawToken) {
    await revokeRefreshToken(prisma, rawToken);
  }

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  clearRefreshCookie(res);
  return res;
}
