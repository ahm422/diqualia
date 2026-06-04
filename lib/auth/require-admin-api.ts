import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyAdminToken } from "./jwt";
import { COOKIE_NAME } from "./session";

export type AdminSession = { id: string; email: string };

export async function requireAdminApi(): Promise<AdminSession | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sub: id, email } = await verifyAdminToken(token);
    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return { id, email };
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
