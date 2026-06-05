import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";
import { revalidatePage } from "@/lib/revalidate-site";

const PostSchema = z.object({
  name: z.string().min(1).max(200),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const sectors = await prisma.industrySector.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(sectors);
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

  const agg = await prisma.industrySector.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const sector = await prisma.industrySector.create({
    data: { name: parsed.data.name, order: nextOrder },
  });

  revalidatePage("/industries");
  return NextResponse.json(sector, { status: 201 });
}
