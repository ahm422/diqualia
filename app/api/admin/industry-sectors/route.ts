import "server-only";

import { NextResponse } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { industrySectorPostSchema } from "@/lib/schemas/admin/industries";
import { revalidateIndustrySector, revalidatePages } from "@/lib/revalidate-site";
import { uniqueSlug } from "@/lib/slugify";

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const sectors = await prisma.industrySector.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(sectors);
}

export async function POST(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = industrySectorPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const agg = await prisma.industrySector.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const slug = await uniqueSlug(parsed.data.name, async (candidate) => {
    const hit = await prisma.industrySector.findUnique({ where: { slug: candidate } });
    return hit != null;
  });

  const sector = await prisma.industrySector.create({
    data: { name: parsed.data.name, slug, order: nextOrder },
  });

  revalidatePages("/", "/industries");
  revalidateIndustrySector(sector.slug);
  return NextResponse.json(sector, { status: 201 });
}
