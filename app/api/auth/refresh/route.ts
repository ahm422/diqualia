import { NextResponse, type NextRequest } from "next/server";

import { signAdminToken } from "@/lib/auth/jwt";
import {
  REFRESH_COOKIE_NAME,
  rotateRefreshToken,
  setRefreshCookie,
} from "@/lib/auth/refresh-tokens";
import { setSessionCookie } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const rawToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!rawToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rotated = await rotateRefreshToken(prisma, rawToken);
  if (!rotated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.ADMIN_EMAIL || rotated.adminUser.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await signAdminToken({
    id: rotated.adminUser.id,
    email: rotated.adminUser.email,
  });

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, accessToken);
  setRefreshCookie(res, rotated.token, rotated.expiresAt);
  return res;
}
