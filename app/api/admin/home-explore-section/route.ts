import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headlineLine1: z.string().min(1).max(200).optional(),
  headlineLine2: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const section = await prisma.homeExploreSection.findUnique({ where: { id: 1 } });
  return NextResponse.json(section);
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const section = await prisma.homeExploreSection.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headlineLine1: parsed.data.headlineLine1 ?? "",
      headlineLine2: parsed.data.headlineLine2 ?? "",
      body: parsed.data.body ?? "",
    },
    update: parsed.data,
  });

  return NextResponse.json(section);
}
