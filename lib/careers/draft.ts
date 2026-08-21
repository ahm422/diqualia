import { z } from "zod";

import type { DbClient } from "@/lib/careers/apply-shared";

export const DraftTokenSchema = z.string().uuid();

export const DRAFT_IN_PROGRESS = "in_progress";
export const DRAFT_COMPLETED = "completed";

export async function findInProgressDraft(prisma: DbClient, token: string) {
  const parsed = DraftTokenSchema.safeParse(token);
  if (!parsed.success) return null;
  const draft = await prisma.careerApplicationDraft.findUnique({
    where: { token: parsed.data },
    include: {
      personal: true,
      education: true,
      professional: true,
      other: true,
      jobOpening: true,
    },
  });
  if (!draft || draft.status !== DRAFT_IN_PROGRESS) return null;
  return draft;
}

export async function findDraftByToken(prisma: DbClient, token: string) {
  const parsed = DraftTokenSchema.safeParse(token);
  if (!parsed.success) return null;
  return prisma.careerApplicationDraft.findUnique({
    where: { token: parsed.data },
    include: {
      personal: true,
      education: true,
      professional: true,
      other: true,
      jobOpening: true,
    },
  });
}

export async function touchDraft(prisma: DbClient, token: string) {
  await prisma.careerApplicationDraft.update({
    where: { token },
    data: { updatedAt: new Date() },
  });
}

export function publicDraftPayload(draft: NonNullable<Awaited<ReturnType<typeof findDraftByToken>>>) {
  return {
    token: draft.token,
    jobOpeningId: draft.jobOpeningId,
    status: draft.status,
    personal: draft.personal
      ? {
          name: draft.personal.name,
          email: draft.personal.email,
          phone: draft.personal.phone,
          fatherOrHusbandName: draft.personal.fatherOrHusbandName,
          dateOfBirth: draft.personal.dateOfBirth,
          gender: draft.personal.gender,
          maritalStatus: draft.personal.maritalStatus,
          nationality: draft.personal.nationality,
          cnic: draft.personal.cnic,
          currentAddress: draft.personal.currentAddress,
          city: draft.personal.city,
        }
      : null,
    education: draft.education
      ? {
          highestQualification: draft.education.highestQualification,
          fieldOfStudy: draft.education.fieldOfStudy,
          institutionName: draft.education.institutionName,
          yearOfCompletion: draft.education.yearOfCompletion,
        }
      : null,
    professional: draft.professional
      ? {
          yearsOfExperience: draft.professional.yearsOfExperience,
          currentEmployer: draft.professional.currentEmployer,
          currentJobTitle: draft.professional.currentJobTitle,
          coverNote: draft.professional.coverNote,
        }
      : null,
    other: draft.other
      ? {
          keySkills: draft.other.keySkills,
          noticePeriodDays: draft.other.noticePeriodDays,
          expectedSalary: draft.other.expectedSalary,
          availableFrom: draft.other.availableFrom,
          declarationAccepted: draft.other.declarationAccepted,
          resumeUploaded: Boolean(draft.other.resumeKey),
          photoUploaded: Boolean(draft.other.photoKey),
        }
      : null,
  };
}
