import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  groupLabel: z.string().min(1).max(200).nullable().optional(),
  body: z.string().min(1).max(2000).nullable().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const sectionId = parseInt(id, 10);
  if (isNaN(sectionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const items = await prisma.serviceItem.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const sectionId = parseInt(id, 10);
  if (isNaN(sectionId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const section = await prisma.serviceSection.findUnique({ where: { id: sectionId } });
  if (!section) return NextResponse.json({ error: "Section not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const agg = await prisma.serviceItem.aggregate({
    where: { sectionId },
    _max: { order: true },
  });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const item = await prisma.serviceItem.create({
    data: {
      sectionId,
      title: parsed.data.title,
      groupLabel: parsed.data.groupLabel ?? null,
      body: parsed.data.body ?? null,
      order: nextOrder,
    },
  });

  revalidatePage("/services");
  return NextResponse.json(item, { status: 201 });
}
