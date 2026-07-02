import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PostSchema = z.object({
  href: z.string().min(1).max(500),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  sectionLabel: z.string().max(200).optional(),
  visible: z.boolean().optional(),
});

export async function GET() {
  const prisma = getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const cards = await prisma.homeExploreCard.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(cards);
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
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const agg = await prisma.homeExploreCard.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const card = await prisma.homeExploreCard.create({
    data: {
      href: parsed.data.href,
      title: parsed.data.title,
      body: parsed.data.body,
      sectionLabel: parsed.data.sectionLabel ?? null,
      visible: parsed.data.visible ?? true,
      order: nextOrder,
    },
  });

  revalidatePage("/");
  return NextResponse.json(card, { status: 201 });
}
