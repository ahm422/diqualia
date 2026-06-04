import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { prisma } from "@/lib/prisma";

const PatchSchema = z.object({
  eyebrow: z.string().min(1).max(200).optional(),
  headline: z.string().min(1).max(500).optional(),
  body: z.string().min(1).max(2000).optional(),
  stat1Value: z.string().min(1).max(50).optional(),
  stat1Label: z.string().min(1).max(100).optional(),
  stat2Value: z.string().min(1).max(50).optional(),
  stat2Label: z.string().min(1).max(100).optional(),
  stat3Value: z.string().min(1).max(50).optional(),
  stat3Label: z.string().min(1).max(100).optional(),
  stat4Value: z.string().min(1).max(50).optional(),
  stat4Label: z.string().min(1).max(100).optional(),
  ctaEyebrow: z.string().min(1).max(200).optional(),
  ctaHeadline: z.string().min(1).max(500).optional(),
  ctaBody: z.string().min(1).max(2000).optional(),
  ctaBtn1Label: z.string().min(1).max(100).optional(),
  ctaBtn1Href: z.string().min(1).max(500).optional(),
  ctaEmailHref: z.string().min(1).max(500).optional(),
});

export async function GET() {
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const page = await prisma.servicesPage.findUnique({ where: { id: 1 } });
  return NextResponse.json(page);
}

export async function PATCH(request: Request) {
  const session = await requireAdminApi();
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

  const page = await prisma.servicesPage.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      eyebrow: parsed.data.eyebrow ?? "",
      headline: parsed.data.headline ?? "",
      body: parsed.data.body ?? "",
      stat1Value: parsed.data.stat1Value ?? "",
      stat1Label: parsed.data.stat1Label ?? "",
      stat2Value: parsed.data.stat2Value ?? "",
      stat2Label: parsed.data.stat2Label ?? "",
      stat3Value: parsed.data.stat3Value ?? "",
      stat3Label: parsed.data.stat3Label ?? "",
      stat4Value: parsed.data.stat4Value ?? "",
      stat4Label: parsed.data.stat4Label ?? "",
      ctaEyebrow: parsed.data.ctaEyebrow ?? "",
      ctaHeadline: parsed.data.ctaHeadline ?? "",
      ctaBody: parsed.data.ctaBody ?? "",
      ctaBtn1Label: parsed.data.ctaBtn1Label ?? "",
      ctaBtn1Href: parsed.data.ctaBtn1Href ?? "/",
      ctaEmailHref: parsed.data.ctaEmailHref ?? "",
    },
    update: parsed.data,
  });

  return NextResponse.json(page);
}
