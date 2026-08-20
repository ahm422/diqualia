import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headlineLine1: z.string().min(1).max(200).optional(),
  headlineLine2: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
  sectorsLabel: z.string().min(1).max(200).optional(),
  sectorsDescription: z.string().min(1).max(2000).optional(),
  sidebarLabel: z.string().min(1).max(200).optional(),
  sidebarCopy: z.string().min(1).max(2000).optional(),
  whereNextEyebrow: z.string().min(1).max(200).optional(),
  whereNextTitle1: z.string().min(1).max(200).optional(),
  whereNextTitle2: z.string().min(1).max(200).optional(),
  whereNextBody: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const page = await prisma.industriesPage.findUnique({ where: { id: 1 } });
  return NextResponse.json(page);
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

  const page = await prisma.industriesPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headlineLine1: parsed.data.headlineLine1 ?? "",
      headlineLine2: parsed.data.headlineLine2 ?? "",
      body: parsed.data.body ?? "",
      sectorsLabel: parsed.data.sectorsLabel ?? "",
      sectorsDescription: parsed.data.sectorsDescription ?? "",
      sidebarLabel: parsed.data.sidebarLabel ?? "",
      sidebarCopy: parsed.data.sidebarCopy ?? "",
      whereNextEyebrow: parsed.data.whereNextEyebrow ?? "",
      whereNextTitle1: parsed.data.whereNextTitle1 ?? "",
      whereNextTitle2: parsed.data.whereNextTitle2 ?? "",
      whereNextBody: parsed.data.whereNextBody ?? "",
    },
    update: parsed.data,
  });

  revalidatePage("/industries");
  return NextResponse.json(page);
}
