import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headline: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const hero = await prisma.aboutHero.findUnique({ where: { id: 1 } });
  return NextResponse.json(hero);
}

export async function PATCH(request: Request) {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.edit");
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

  const hero = await prisma.aboutHero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headline: parsed.data.headline ?? "",
      body: parsed.data.body ?? "",
    },
    update: parsed.data,
  });

  revalidatePage("/about");
  return NextResponse.json(hero);
}
