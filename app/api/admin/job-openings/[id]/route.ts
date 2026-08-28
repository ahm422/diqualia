import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { Prisma } from "@/lib/generated/prisma/client";
import { revalidateJobOpening, revalidatePage } from "@/lib/revalidate-site";
import { jobOpeningPatchSchema } from "@/lib/schemas/admin/career";

function parseId(id: string): number | null {
  const numId = parseInt(id, 10);
  return Number.isInteger(numId) && String(numId) === id ? numId : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("careers.openings.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = parseId(id);
  if (numId == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const opening = await prisma.jobOpening.findUnique({ where: { id: numId } });
  if (!opening) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(opening);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("careers.openings.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = parseId(id);
  if (numId == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = jobOpeningPatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.jobOpening.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.slug && parsed.data.slug !== existing.slug) {
    const conflict = await prisma.jobOpening.findFirst({
      where: { slug: parsed.data.slug, id: { not: numId } },
    });
    if (conflict) {
      return NextResponse.json({ error: "slug already exists" }, { status: 400 });
    }
  }

  try {
    const { niceToHave, ...rest } = parsed.data;
    const opening = await prisma.jobOpening.update({
      where: { id: numId },
      data: {
        ...rest,
        ...(niceToHave !== undefined
          ? { niceToHave: niceToHave === null ? Prisma.DbNull : niceToHave }
          : {}),
      },
    });

    revalidatePage("/careers");
    revalidateJobOpening(opening.slug);
    if (existing.slug !== opening.slug) {
      revalidateJobOpening(existing.slug);
    }

    return NextResponse.json(opening);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("careers.openings.manage");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const numId = parseId(id);
  if (numId == null) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.jobOpening.findUnique({ where: { id: numId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.jobOpening.delete({ where: { id: numId } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidatePage("/careers");
  revalidateJobOpening(existing.slug);

  return NextResponse.json({ ok: true });
}
