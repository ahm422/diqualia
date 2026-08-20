import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidateSiteLayout } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  tagline1: z.string().min(1).max(200).optional(),
  tagline2: z.string().min(1).max(200).optional(),
  copyright: z.string().min(1).max(200).optional(),
  domain: z.string().min(1).max(200).optional(),
  allRights: z.string().min(1).max(200).optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const footer = await prisma.footerSettings.findUnique({ where: { id: 1 } });
  return NextResponse.json(footer);
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

  const footer = await prisma.footerSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      tagline1: parsed.data.tagline1 ?? "",
      tagline2: parsed.data.tagline2 ?? "",
      copyright: parsed.data.copyright ?? "",
      domain: parsed.data.domain ?? "",
      allRights: parsed.data.allRights ?? "",
    },
    update: parsed.data,
  });

  revalidateSiteLayout();
  return NextResponse.json(footer);
}
