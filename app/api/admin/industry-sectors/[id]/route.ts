import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { Prisma } from "@/lib/generated/prisma/client";
import { industrySectorPatchSchema } from "@/lib/schemas/admin/industries";
import { revalidateIndustrySector, revalidatePages } from "@/lib/revalidate-site";

function emptyToNull(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return value;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = Number.parseInt(id, 10);
  if (Number.isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = industrySectorPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.industrySector.findUnique({ where: { id: numId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await prisma.industrySector.findFirst({
      where: { slug: parsed.data.slug, id: { not: numId } },
    });
    if (conflict) {
      return NextResponse.json({ error: "slug already exists" }, { status: 400 });
    }
  }

  const data: Prisma.IndustrySectorUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.visible !== undefined) data.visible = parsed.data.visible;
  if (parsed.data.order !== undefined) data.order = parsed.data.order;
  if (parsed.data.slug !== undefined) data.slug = parsed.data.slug;
  if (parsed.data.eyebrow !== undefined) data.eyebrow = emptyToNull(parsed.data.eyebrow) ?? null;
  if (parsed.data.headline !== undefined) data.headline = emptyToNull(parsed.data.headline) ?? null;
  if (parsed.data.body !== undefined) data.body = emptyToNull(parsed.data.body) ?? null;
  if (parsed.data.heroImageUrl !== undefined) data.heroImageUrl = emptyToNull(parsed.data.heroImageUrl) ?? null;
  if (parsed.data.whyPoints !== undefined) {
    data.whyPoints = parsed.data.whyPoints === null ? Prisma.DbNull : parsed.data.whyPoints;
  }
  if (parsed.data.caseStudyRefs !== undefined) {
    data.caseStudyRefs = parsed.data.caseStudyRefs === null ? Prisma.DbNull : parsed.data.caseStudyRefs;
  }

  try {
    const sector = await prisma.industrySector.update({ where: { id: numId }, data });

    revalidatePages("/", "/industries");
    revalidateIndustrySector(sector.slug);
    if (existing.slug !== sector.slug) {
      revalidateIndustrySector(existing.slug);
    }

    return NextResponse.json(sector);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = Number.parseInt(id, 10);
  if (Number.isNaN(numId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.industrySector.findUnique({ where: { id: numId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await prisma.industrySector.delete({ where: { id: numId } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const remaining = await prisma.industrySector.findMany({ orderBy: { order: "asc" } });
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i) {
      await prisma.industrySector.update({ where: { id: remaining[i].id }, data: { order: i } });
    }
  }

  revalidatePages("/", "/industries");
  revalidateIndustrySector(existing.slug);
  return NextResponse.json({ ok: true });
}
