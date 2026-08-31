import { NextResponse, type NextRequest } from "next/server";

import {
  alreadyAppliedBody,
  careersSubmitRateLimit,
  persistJobApplication,
  sendApplicationEmails,
  validationError,
} from "@/lib/careers/apply-shared";
import { ensureApplicantAccount } from "@/lib/careers/applicant-account";
import { DRAFT_COMPLETED, DraftTokenSchema, findDraftByToken } from "@/lib/careers/draft";
import { getDb } from "@/lib/cloudflare-env";
import { CareerApplyFieldsSchema } from "@/lib/schemas/public/career-apply";

export async function POST(request: NextRequest) {
  const limited = careersSubmitRateLimit(request);
  if (limited) return limited;

  let body: { token?: unknown; website?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; website?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const websiteRaw = typeof body.website === "string" ? body.website : "";
  if (websiteRaw.trim().length > 0) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const tokenParsed = DraftTokenSchema.safeParse(body.token);
  if (!tokenParsed.success) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const prisma = await getDb();
  const draft = await findDraftByToken(prisma, tokenParsed.data);
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const opening = draft.jobOpening;
  if (!opening || !opening.visible) {
    return NextResponse.json({ error: "This opening is not available" }, { status: 400 });
  }

  const { personal, education, professional, other } = draft;
  if (!personal || !education || !professional || !other) {
    return NextResponse.json({ error: "Application is incomplete" }, { status: 400 });
  }
  if (!other.resumeKey || !other.photoKey) {
    return NextResponse.json({ error: "Resume and photograph are required" }, { status: 400 });
  }

  if (draft.status === DRAFT_COMPLETED) {
    const existing = await prisma.jobApplication.findFirst({
      where: { jobOpeningId: opening.id, email: personal.email },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: existing.id });
  }

  const parsed = CareerApplyFieldsSchema.safeParse({
    name: personal.name,
    email: personal.email,
    phone: personal.phone,
    jobOpeningId: String(opening.id),
    coverNote: professional.coverNote ?? "",
    fatherOrHusbandName: personal.fatherOrHusbandName ?? "",
    dateOfBirth: personal.dateOfBirth,
    gender: personal.gender,
    maritalStatus: personal.maritalStatus ?? "",
    cnic: personal.cnic ?? "",
    nationality: personal.nationality,
    currentAddress: personal.currentAddress,
    city: personal.city,
    highestQualification: education.highestQualification,
    fieldOfStudy: education.fieldOfStudy ?? "",
    institutionName: education.institutionName ?? "",
    yearOfCompletion: education.yearOfCompletion ?? "",
    yearsOfExperience: professional.yearsOfExperience,
    currentEmployer: professional.currentEmployer ?? "",
    currentJobTitle: professional.currentJobTitle ?? "",
    keySkills: other.keySkills,
    noticePeriodDays: other.noticePeriodDays,
    expectedSalary: other.expectedSalary,
    availableFrom: other.availableFrom,
    declarationAccepted: other.declarationAccepted ? "true" : "",
  });
  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const persisted = await persistJobApplication({
    prisma,
    fields: parsed.data,
    opening,
    resumeKey: other.resumeKey,
    photoKey: other.photoKey,
  });
  if (!persisted.ok) {
    if (persisted.status === 409) {
      return NextResponse.json(alreadyAppliedBody(persisted.field), { status: 409 });
    }
    return NextResponse.json({ error: persisted.error }, { status: persisted.status });
  }

  await prisma.careerApplicationDraft.update({
    where: { token: draft.token },
    data: { status: DRAFT_COMPLETED, updatedAt: new Date() },
  });

  const account = await ensureApplicantAccount(prisma, parsed.data.email);
  await prisma.jobApplication.update({
    where: { id: persisted.id },
    data: { applicantUserId: account.applicantUserId },
  });

  await sendApplicationEmails({
    fields: parsed.data,
    openingTitle: opening.title,
    applicationId: persisted.id,
    portalPassword: account.generatedPassword,
  });

  return NextResponse.json({ ok: true, id: persisted.id });
}
