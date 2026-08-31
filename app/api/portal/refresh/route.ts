import { NextResponse, type NextRequest } from "next/server";

import { getDb } from "@/lib/cloudflare-env";
import { signPortalToken } from "@/lib/portal/portal-jwt";
import {
  PORTAL_REFRESH_COOKIE_NAME,
  rotatePortalRefreshToken,
  setPortalRefreshCookie,
} from "@/lib/portal/portal-refresh-tokens";
import { setPortalCookie } from "@/lib/portal/session";

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const rawToken = request.cookies.get(PORTAL_REFRESH_COOKIE_NAME)?.value;
  if (!rawToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rotated = await rotatePortalRefreshToken(prisma, rawToken);
  if (!rotated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await signPortalToken({
    id: rotated.applicantUser.id,
    email: rotated.applicantUser.email,
  });

  const res = NextResponse.json({ ok: true });
  setPortalCookie(res, accessToken);
  setPortalRefreshCookie(res, rotated.token, rotated.expiresAt);
  return res;
}
