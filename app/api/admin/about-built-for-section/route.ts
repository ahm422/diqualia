import "server-only";

import { NextResponse } from "next/server";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePages } from "@/lib/revalidate-site";
import { aboutBuiltForSectionPatchSchema } from "@/lib/schemas/admin/about";

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const section = await prisma.aboutBuiltForSection.findUnique({ where: { id: 1 } });
  return NextResponse.json(section);
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

  const parsed = aboutBuiltForSectionPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const section = await prisma.aboutBuiltForSection.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "What we're built for",
      headlineLine1: parsed.data.headlineLine1 ?? "Intelligence that compounds —",
      headlineLine2: parsed.data.headlineLine2 ?? "not tactics that expire.",
    },
    update: parsed.data,
  });

  revalidatePages("/about", "/");
  return NextResponse.json(section);
}
