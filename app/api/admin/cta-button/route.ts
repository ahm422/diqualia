import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidateSiteLayout } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  href: z.string().min(1).max(500).optional(),
  visible: z.boolean().optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const cta = await prisma.ctaButton.findUnique({ where: { id: 1 } });
  return NextResponse.json(cta);
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
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const cta = await prisma.ctaButton.upsert({
    where: { id: 1 },
    create: { id: 1, label: parsed.data.label ?? "Talk to Us", href: parsed.data.href ?? "/contact", visible: parsed.data.visible ?? true },
    update: parsed.data,
  });

  revalidateSiteLayout();
  return NextResponse.json(cta);
}
