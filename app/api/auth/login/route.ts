import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { signAdminToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

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
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `login:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  const { email, password } = parsed.data;

  if (email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { email } });
  if (!adminUser) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await verifyPassword(password, adminUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signAdminToken({ id: adminUser.id, email: adminUser.email });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}
