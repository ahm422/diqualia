import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  groupLabel: z.string().min(1).max(200).nullable().optional(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).nullable().optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; iid: string }> }) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id, iid } = await params;
  const sectionId = parseInt(id, 10);
  const itemId = parseInt(iid, 10);
  if (isNaN(sectionId) || isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const item = await prisma.serviceItem.update({
      where: { id: itemId, sectionId },
      data: parsed.data,
    });
    revalidatePage("/services");
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; iid: string }> }) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id, iid } = await params;
  const sectionId = parseInt(id, 10);
  const itemId = parseInt(iid, 10);
  if (isNaN(sectionId) || isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.serviceItem.delete({ where: { id: itemId, sectionId } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const remaining = await prisma.serviceItem.findMany({
    where: { sectionId },
    orderBy: { order: "asc" },
  });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.serviceItem.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  revalidatePage("/services");
  return NextResponse.json({ ok: true });
}
