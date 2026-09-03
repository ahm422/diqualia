import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headlineLine1: z.string().min(1).max(200).optional(),
  headlineLine2: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(2000).optional(),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const section = await prisma.homeExploreSection.findUnique({ where: { id: 1 } });
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

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const section = await prisma.homeExploreSection.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headlineLine1: parsed.data.headlineLine1 ?? "",
      headlineLine2: parsed.data.headlineLine2 ?? "",
      body: parsed.data.body ?? "",
    },
    update: parsed.data,
  });

  // NOTE: no public (site) page renders the Explore section yet; this revalidation
  // is a placeholder for whichever page picks it up. Update the path when that lands.
  revalidatePage("/");
  return NextResponse.json(section);
}
