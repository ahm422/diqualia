import "server-only";

import { NextResponse } from "next/server";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";
import { careerPagePatchSchema } from "@/lib/schemas/admin/career";

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const page = await prisma.careerPage.findUnique({ where: { id: 1 } });
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

  const parsed = careerPagePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const page = await prisma.careerPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headlineLine1: parsed.data.headlineLine1 ?? "",
      headlineLine2: parsed.data.headlineLine2 ?? "",
      body: parsed.data.body ?? "",
      cultureEyebrow: parsed.data.cultureEyebrow ?? "",
      cultureHeadline: parsed.data.cultureHeadline ?? "",
      cultureBody: parsed.data.cultureBody ?? "",
      benefits: parsed.data.benefits ?? [],
      applyEyebrow: parsed.data.applyEyebrow ?? "",
      applyHeadline: parsed.data.applyHeadline ?? "",
      applyBody: parsed.data.applyBody ?? "",
    },
    update: parsed.data,
  });

  revalidatePage("/careers");
  return NextResponse.json(page);
}
