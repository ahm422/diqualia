import "server-only";

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/require-admin-api";

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  return NextResponse.json({
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
    permissions: session.permissions,
  });
}
