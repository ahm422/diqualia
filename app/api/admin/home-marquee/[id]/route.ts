import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.edit");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const item = await prisma.homeMarqueeItem.update({ where: { id: numId }, data: parsed.data });
    revalidatePage("/");
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.delete");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.homeMarqueeItem.delete({ where: { id: numId } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const remaining = await prisma.homeMarqueeItem.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.homeMarqueeItem.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  revalidatePage("/");
  return NextResponse.json({ ok: true });
}
