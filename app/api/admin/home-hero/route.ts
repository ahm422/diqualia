import "server-only";

import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";
import { homeHeroPatchSchema } from "@/lib/schemas/admin/home";

export async function GET() {
  const prisma = getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const hero = await prisma.homeHero.findUnique({ where: { id: 1 } });
  return NextResponse.json(hero);
}

export async function PATCH(request: Request) {
  const prisma = getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = homeHeroPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const hero = await prisma.homeHero.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headlineLine1: parsed.data.headlineLine1 ?? "",
      headlineLine2: parsed.data.headlineLine2 ?? "",
      headlineLine3: parsed.data.headlineLine3 ?? "",
      body: parsed.data.body ?? "",
      btn1Label: parsed.data.btn1Label ?? "",
      btn1Href: parsed.data.btn1Href ?? "/",
      btn2Label: parsed.data.btn2Label ?? "",
      btn2Href: parsed.data.btn2Href ?? "/",
      stat1Label: parsed.data.stat1Label ?? "",
      stat1Value: parsed.data.stat1Value ?? "",
      stat2Label: parsed.data.stat2Label ?? "",
      stat2Value: parsed.data.stat2Value ?? "",
      stat3Label: parsed.data.stat3Label ?? "",
      stat3Value: parsed.data.stat3Value ?? "",
    },
    update: parsed.data,
  });

  revalidatePage("/");
  return NextResponse.json(hero);
}
