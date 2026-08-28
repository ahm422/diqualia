import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";
import { revalidatePage } from "@/lib/revalidate-site";

const PostSchema = z.object({
  stepLabel: z.string().min(1).max(100),
  stepNumber: z.string().min(1).max(10),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
});

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("cms.view");
  if (session instanceof NextResponse) return session;

  const steps = await prisma.processStep.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(steps);
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

  const agg = await prisma.processStep.aggregate({ _max: { order: true } });
  const nextOrder = (agg._max.order ?? -1) + 1;

  const step = await prisma.processStep.create({
    data: {
      stepLabel: parsed.data.stepLabel,
      stepNumber: parsed.data.stepNumber,
      title: parsed.data.title,
      body: parsed.data.body,
      order: nextOrder,
    },
  });

  revalidatePage("/process");
  return NextResponse.json(step, { status: 201 });
}
