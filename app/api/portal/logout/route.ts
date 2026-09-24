import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/lib/cloudflare-env";
import {
  PORTAL_REFRESH_COOKIE_NAME,
  clearPortalRefreshCookie,
  revokePortalRefreshToken,
} from "@/lib/portal/portal-refresh-tokens";
import { clearPortalCookie } from "@/lib/portal/session";

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const rawToken = request.cookies.get(PORTAL_REFRESH_COOKIE_NAME)?.value;
  if (rawToken) {
    await revokePortalRefreshToken(prisma, rawToken);
  }

  const res = NextResponse.json({ ok: true });
  clearPortalCookie(res);
  clearPortalRefreshCookie(res);
  return res;
}
