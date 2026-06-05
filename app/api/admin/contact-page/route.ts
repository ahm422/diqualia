import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow:            z.string().min(1).max(200).optional(),
  headlineLine1:      z.string().min(1).max(200).optional(),
  headlineLine2:      z.string().min(1).max(200).optional(),
  body:               z.string().min(1).max(2000).optional(),
  emailLabel:         z.string().min(1).max(200).optional(),
  emailType:          z.string().min(1).max(200).optional(),
  email:              z.string().min(1).max(200).optional(),
  emailCopy:          z.string().min(1).max(2000).optional(),
  whatToIncludeItems: z.array(z.string().min(1).max(500)).optional(),
  expectationEyebrow: z.string().min(1).max(200).optional(),
  expectationText:    z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const page = await prisma.contactPage.findUnique({ where: { id: 1 } });
  return NextResponse.json(page);
}

export async function PATCH(request: Request) {
  const session = await requireAdminApi();
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

  return NextResponse.json(page);
}
