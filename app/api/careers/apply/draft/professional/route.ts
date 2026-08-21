import { NextResponse, type NextRequest } from "next/server";

import { careersDraftRateLimit, validationError } from "@/lib/careers/apply-shared";
import { DraftTokenSchema, findInProgressDraft, touchDraft } from "@/lib/careers/draft";
import { getDb } from "@/lib/cloudflare-env";
import { CareerApplyProfessionalSchema } from "@/lib/schemas/public/career-apply";

export async function PUT(request: NextRequest) {
  const limited = careersDraftRateLimit(request);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tokenParsed = DraftTokenSchema.safeParse(body.token);
  if (!tokenParsed.success) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const parsed = CareerApplyProfessionalSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const prisma = await getDb();
  const draft = await findInProgressDraft(prisma, tokenParsed.data);
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const fields = parsed.data;
  await prisma.careerApplicationDraftProfessional.upsert({
    where: { draftToken: draft.token },
    create: {
      draftToken: draft.token,
      yearsOfExperience: fields.yearsOfExperience,
      currentEmployer: fields.currentEmployer,
      currentJobTitle: fields.currentJobTitle,
      coverNote: fields.coverNote,
    },
    update: {
      yearsOfExperience: fields.yearsOfExperience,
      currentEmployer: fields.currentEmployer,
      currentJobTitle: fields.currentJobTitle,
      coverNote: fields.coverNote,
    },
  });
  await touchDraft(prisma, draft.token);

  return NextResponse.json({ ok: true });
}
