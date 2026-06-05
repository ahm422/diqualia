import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow:        z.string().min(1).max(200).optional(),
  headlineLine1:  z.string().min(1).max(200).optional(),
  headlineLine2:  z.string().min(1).max(200).optional(),
  headlineLine3:  z.string().min(1).max(200).optional(),
  body:           z.string().min(1).max(2000).optional(),
  dxNum1:         z.string().min(1).max(200).optional(),
  dxTitle1:       z.string().min(1).max(200).optional(),
  dxBody1:        z.string().min(1).max(2000).optional(),
  dxNum2:         z.string().min(1).max(200).optional(),
  dxTitle2:       z.string().min(1).max(200).optional(),
  dxBody2:        z.string().min(1).max(2000).optional(),
  dxTagline:      z.string().min(1).max(2000).optional(),
  manifestoItems: z.array(z.string().min(1).max(2000)).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const page = await prisma.storyPage.findUnique({ where: { id: 1 } });
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

  return NextResponse.json(page);
}
