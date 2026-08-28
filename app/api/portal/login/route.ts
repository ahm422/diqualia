import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/cloudflare-env";
import { signPortalToken } from "@/lib/portal/portal-jwt";
import {
  issuePortalRefreshToken,
  setPortalRefreshCookie,
} from "@/lib/portal/portal-refresh-tokens";
import { setPortalCookie } from "@/lib/portal/session";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const BodySchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1024),
});

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `portal-login:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.applicantUser.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signPortalToken({ id: user.id, email: user.email });
  const refresh = await issuePortalRefreshToken(prisma, user.id);
  await prisma.applicantUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const res = NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword });
  setPortalCookie(res, token);
  setPortalRefreshCookie(res, refresh.token, refresh.expiresAt);
  return res;
}
