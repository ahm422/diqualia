import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePages } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  tabId: z.string().min(1).max(50).optional(),
  eyebrow: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
  cardTitle: z.string().min(1).max(500).nullable().optional(),
  cardBody: z.string().min(1).max(2000).nullable().optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
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

  if (parsed.data.tabId) {
    const conflict = await prisma.serviceSection.findFirst({
      where: { tabId: parsed.data.tabId, id: { not: numId } },
    });
    if (conflict) return NextResponse.json({ error: "tabId already exists" }, { status: 400 });
  }

  try {
    const section = await prisma.serviceSection.update({
      where: { id: numId },
      data: parsed.data,
      include: { items: { orderBy: { order: "asc" } } },
    });
    revalidatePages("/", "/services");
    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.serviceSection.delete({ where: { id: numId } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const remaining = await prisma.serviceSection.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.serviceSection.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  revalidatePages("/", "/services");
  return NextResponse.json({ ok: true });
}
