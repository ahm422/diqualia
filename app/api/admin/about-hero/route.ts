import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headline: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const hero = await prisma.aboutHero.findUnique({ where: { id: 1 } });
  return NextResponse.json(hero);
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

  const hero = await prisma.aboutHero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headline: parsed.data.headline ?? "",
      body: parsed.data.body ?? "",
    },
    update: parsed.data,
  });

  return NextResponse.json(hero);
}
