import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyAdminToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const { sub: id, email } = await verifyAdminToken(token);
    return NextResponse.json({ authenticated: true, user: { id, email } });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
