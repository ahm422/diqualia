import "server-only";

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";

export async function GET(request: Request) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const sort      = searchParams.get("sort") === "asc" ? "asc" as const : "desc" as const;
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: sort },
    where: unreadOnly ? { read: false } : undefined,
  });

  return NextResponse.json(leads);
}
