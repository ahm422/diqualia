import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePages } from "@/lib/revalidate-site";

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const items = await prisma.aboutBuiltForItem.findMany({ orderBy: { order: "asc" } });
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

  const agg = await prisma.aboutBuiltForItem.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const item = await prisma.aboutBuiltForItem.create({
    data: { title: parsed.data.title, description: parsed.data.description, order: nextOrder },
  });

  revalidatePages("/", "/about");
  return NextResponse.json(item, { status: 201 });
}
