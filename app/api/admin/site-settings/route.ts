import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidateSiteLayout } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  siteName: z.string().min(1).max(200).optional(),
  logoUrl: z.string().url().max(2000).nullable().optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.edit");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, siteName: parsed.data.siteName ?? "DiQualia", logoUrl: parsed.data.logoUrl ?? null },
    update: parsed.data,
  });

  revalidateSiteLayout();
  return NextResponse.json(settings);
}
