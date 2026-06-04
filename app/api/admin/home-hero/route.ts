import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headlineLine1: z.string().min(1).max(200).optional(),
  headlineLine2: z.string().min(1).max(200).optional(),
  headlineLine3: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
  btn1Label: z.string().min(1).max(100).optional(),
  btn1Href: z.string().min(1).max(500).optional(),
  btn2Label: z.string().min(1).max(100).optional(),
  btn2Href: z.string().min(1).max(500).optional(),
  stat1Label: z.string().min(1).max(100).optional(),
  stat1Value: z.string().min(1).max(50).optional(),
  stat2Label: z.string().min(1).max(100).optional(),
  stat2Value: z.string().min(1).max(50).optional(),
  stat3Label: z.string().min(1).max(100).optional(),
  stat3Value: z.string().min(1).max(50).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const hero = await prisma.homeHero.findUnique({ where: { id: 1 } });
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

  const hero = await prisma.homeHero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headlineLine1: parsed.data.headlineLine1 ?? "",
      headlineLine2: parsed.data.headlineLine2 ?? "",
      headlineLine3: parsed.data.headlineLine3 ?? "",
      body: parsed.data.body ?? "",
      btn1Label: parsed.data.btn1Label ?? "",
      btn1Href: parsed.data.btn1Href ?? "/",
      btn2Label: parsed.data.btn2Label ?? "",
      btn2Href: parsed.data.btn2Href ?? "/",
      stat1Label: parsed.data.stat1Label ?? "",
      stat1Value: parsed.data.stat1Value ?? "",
      stat2Label: parsed.data.stat2Label ?? "",
      stat2Value: parsed.data.stat2Value ?? "",
      stat3Label: parsed.data.stat3Label ?? "",
      stat3Value: parsed.data.stat3Value ?? "",
    },
    update: parsed.data,
  });

  return NextResponse.json(hero);
}
