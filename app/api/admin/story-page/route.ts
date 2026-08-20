import "server-only";

import { NextResponse } from "next/server";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";
import { storyPagePatchSchema } from "@/lib/schemas/admin/story";

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const page = await prisma.storyPage.findUnique({ where: { id: 1 } });
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

  const parsed = storyPagePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const page = await prisma.storyPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow:        parsed.data.eyebrow        ?? "",
      headlineLine1:  parsed.data.headlineLine1   ?? "",
      headlineLine2:  parsed.data.headlineLine2   ?? "",
      headlineLine3:  parsed.data.headlineLine3   ?? "",
      body:           parsed.data.body            ?? "",
      dxNum1:         parsed.data.dxNum1          ?? "",
      dxTitle1:       parsed.data.dxTitle1        ?? "",
      dxBody1:        parsed.data.dxBody1         ?? "",
      dxNum2:         parsed.data.dxNum2          ?? "",
      dxTitle2:       parsed.data.dxTitle2        ?? "",
      dxBody2:        parsed.data.dxBody2         ?? "",
      dxTagline:      parsed.data.dxTagline       ?? "",
      manifestoItems: parsed.data.manifestoItems  ?? [],
    },
    update: parsed.data,
  });

  revalidatePage("/story");
  return NextResponse.json(page);
}
