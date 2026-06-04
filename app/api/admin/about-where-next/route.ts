import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headline: z.string().min(1).max(500).optional(),
  btn1Label: z.string().min(1).max(200).optional(),
  btn1Href: z.string().min(1).max(500).optional(),
  btn2Label: z.string().min(1).max(200).optional(),
  btn2Href: z.string().min(1).max(500).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const whereNext = await prisma.aboutWhereNext.findUnique({ where: { id: 1 } });
  return NextResponse.json(whereNext);
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

  const whereNext = await prisma.aboutWhereNext.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headline: parsed.data.headline ?? "",
      btn1Label: parsed.data.btn1Label ?? "",
      btn1Href: parsed.data.btn1Href ?? "/",
      btn2Label: parsed.data.btn2Label ?? "",
      btn2Href: parsed.data.btn2Href ?? "/",
    },
    update: parsed.data,
  });

  return NextResponse.json(whereNext);
}
