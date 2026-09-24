import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidateSiteLayout } from "@/lib/revalidate-site";

const PostSchema = z.object({
  href: z.string().min(1).max(500),
  label: z.string().min(1).max(100),
  group: z.enum(["primary", "secondary"]),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const items = await prisma.footerNavItem.findMany({
    orderBy: [{ group: "asc" }, { order: "asc" }],
  });
  return NextResponse.json(items);
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

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const agg = await prisma.footerNavItem.aggregate({
    where: { group: parsed.data.group },
    _max: { order: true },
  });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const item = await prisma.footerNavItem.create({
    data: { href: parsed.data.href, label: parsed.data.label, group: parsed.data.group, order: nextOrder },
  });

  revalidateSiteLayout();
  return NextResponse.json(item, { status: 201 });
}
