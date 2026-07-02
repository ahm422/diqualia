import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PostSchema = z.object({
  tabId: z.string().min(1).max(50),
  eyebrow: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  cardTitle: z.string().min(1).max(500).optional(),
  cardBody: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const prisma = getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const sections = await prisma.serviceSection.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  const prisma = getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.serviceSection.findUnique({ where: { tabId: parsed.data.tabId } });
  if (existing) {
    return NextResponse.json({ error: "tabId already exists" }, { status: 400 });
  }

  const agg = await prisma.serviceSection.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const section = await prisma.serviceSection.create({
    data: {
      tabId: parsed.data.tabId,
      eyebrow: parsed.data.eyebrow,
      title: parsed.data.title,
      body: parsed.data.body,
      cardTitle: parsed.data.cardTitle ?? null,
      cardBody: parsed.data.cardBody ?? null,
      order: nextOrder,
    },
    include: { items: true },
  });

  revalidatePage("/services");
  return NextResponse.json(section, { status: 201 });
}
