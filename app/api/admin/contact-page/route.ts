import "server-only";

import { NextResponse } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";
import { contactPagePatchSchema } from "@/lib/schemas/admin/contact";

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const page = await prisma.contactPage.findUnique({ where: { id: 1 } });
  return NextResponse.json(page);
}

export async function PATCH(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactPagePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const page = await prisma.contactPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow:            parsed.data.eyebrow            ?? "",
      headlineLine1:      parsed.data.headlineLine1       ?? "",
      headlineLine2:      parsed.data.headlineLine2       ?? "",
      body:               parsed.data.body               ?? "",
      emailLabel:         parsed.data.emailLabel         ?? "",
      emailType:          parsed.data.emailType          ?? "",
      email:              parsed.data.email              ?? "",
      emailCopy:          parsed.data.emailCopy          ?? "",
      whatToIncludeItems: parsed.data.whatToIncludeItems ?? [],
      expectationEyebrow: parsed.data.expectationEyebrow ?? "",
      expectationText:    parsed.data.expectationText    ?? "",
    },
    update: parsed.data,
  });

  revalidatePage("/contact");
  return NextResponse.json(page);
}
