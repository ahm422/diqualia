import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headline: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(2000).optional(),
  btnLabel: z.string().min(1).max(100).optional(),
  btnHref: z.string().min(1).max(500).optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const whereNext = await prisma.homeWhereNext.findUnique({ where: { id: 1 } });
  return NextResponse.json(whereNext);
}

export async function PATCH(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.edit");
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const whereNext = await prisma.homeWhereNext.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headline: parsed.data.headline ?? "",
      body: parsed.data.body ?? "",
      btnLabel: parsed.data.btnLabel ?? "",
      btnHref: parsed.data.btnHref ?? "/",
    },
    update: parsed.data,
  });

  revalidatePage("/");
  return NextResponse.json(whereNext);
}
