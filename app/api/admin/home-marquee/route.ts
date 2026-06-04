import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PostSchema = z.object({
  text: z.string().min(1).max(500),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const items = await prisma.homeMarqueeItem.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
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

  const agg = await prisma.homeMarqueeItem.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const item = await prisma.homeMarqueeItem.create({
    data: { text: parsed.data.text, order: nextOrder },
  });

  return NextResponse.json(item, { status: 201 });
}
