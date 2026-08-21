import { NextResponse, type NextRequest } from "next/server";

import { careersDraftRateLimit, findVisibleOpening } from "@/lib/careers/apply-shared";
import { DRAFT_IN_PROGRESS } from "@/lib/careers/draft";
import { getDb } from "@/lib/cloudflare-env";

export async function POST(request: NextRequest) {
  const limited = careersDraftRateLimit(request);
  if (limited) return limited;

  let body: { jobSlug?: unknown; jobOpeningId?: unknown };
  try {
    body = (await request.json()) as { jobSlug?: unknown; jobOpeningId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prisma = await getDb();
  const opening = await findVisibleOpening(prisma, {
    jobOpeningId: typeof body.jobOpeningId === "number" ? String(body.jobOpeningId) : String(body.jobOpeningId ?? ""),
    jobSlug: typeof body.jobSlug === "string" ? body.jobSlug : "",
  });
  if (!opening) {
    return NextResponse.json({ error: "This opening is not available" }, { status: 400 });
  }

  const token = crypto.randomUUID();
  await prisma.careerApplicationDraft.create({
    data: {
      token,
      jobOpeningId: opening.id,
      status: DRAFT_IN_PROGRESS,
    },
  });

  return NextResponse.json({ token, jobOpeningId: opening.id });
}
