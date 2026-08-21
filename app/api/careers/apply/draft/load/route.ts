import { NextResponse, type NextRequest } from "next/server";

import { careersDraftRateLimit } from "@/lib/careers/apply-shared";
import { DRAFT_IN_PROGRESS, DraftTokenSchema, findDraftByToken, publicDraftPayload } from "@/lib/careers/draft";
import { getDb } from "@/lib/cloudflare-env";

export async function POST(request: NextRequest) {
  const limited = careersDraftRateLimit(request);
  if (limited) return limited;

  let body: { token?: unknown };
  try {
    body = (await request.json()) as { token?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = DraftTokenSchema.safeParse(body.token);
  if (!parsed.success) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const prisma = await getDb();
  const draft = await findDraftByToken(prisma, parsed.data);
  if (!draft || draft.status !== DRAFT_IN_PROGRESS) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  return NextResponse.json(publicDraftPayload(draft));
}
