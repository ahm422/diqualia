import "server-only";

import { NextResponse } from "next/server";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { Prisma } from "@/lib/generated/prisma/client";
import { revalidateJobOpening, revalidatePage } from "@/lib/revalidate-site";
import { jobOpeningCreateSchema } from "@/lib/schemas/admin/career";
import { uniqueSlug } from "@/lib/slugify";

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const openings = await prisma.jobOpening.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(openings);
}

export async function POST(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.create");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = jobOpeningCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.title, async (candidate) => {
    const existing = await prisma.jobOpening.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const agg = await prisma.jobOpening.aggregate({ _max: { order: true } });
  const nextOrder = parsed.data.order ?? (agg._max.order ?? -1) + 1;

  const opening = await prisma.jobOpening.create({
    data: {
      slug,
      title: parsed.data.title,
      department: parsed.data.department,
      location: parsed.data.location,
      type: parsed.data.type,
      description: parsed.data.description,
      requirements: parsed.data.requirements ?? [],
      responsibilities: parsed.data.responsibilities ?? [],
      niceToHave: parsed.data.niceToHave ?? Prisma.DbNull,
      seniority: parsed.data.seniority ?? null,
      salaryRange: parsed.data.salaryRange ?? null,
      remote: parsed.data.remote ?? null,
      teamNote: parsed.data.teamNote ?? null,
      visible: parsed.data.visible ?? true,
      order: nextOrder,
    },
  });

  revalidatePage("/careers");
  if (opening.visible) {
    revalidateJobOpening(opening.slug);
  }

  return NextResponse.json(opening, { status: 201 });
}
