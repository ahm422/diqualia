import { NextResponse, type NextRequest } from "next/server";

import { cnicLast4 } from "@/lib/cnic";
import { getEmail } from "@/lib/cloudflare-env";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import { Prisma } from "@/lib/generated/prisma/client";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import type { CareerApplyFields } from "@/lib/schemas/public/career-apply";
import type { getStorage } from "@/lib/storage";

export const ALREADY_APPLIED_MESSAGE = "You have already applied for this role.";

export type DbClient = PrismaClient;
export type StorageClient = ReturnType<typeof getStorage>;

export function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export function careersSubmitRateLimit(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `careers:${ip}`, limit: 5, windowMs: 60_000 });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);
  return null;
}

export function careersDraftRateLimit(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `careers-draft:${ip}`, limit: 30, windowMs: 60_000 });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);
  return null;
}

export function isUniqueConstraintError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return true;
  const message = err instanceof Error ? err.message : String(err);
  return /UNIQUE constraint failed/i.test(message);
}

export async function findVisibleOpening(
  prisma: DbClient,
  fields: { jobOpeningId?: string | null; jobSlug?: string | null },
) {
  let opening = null;
  const rawId = fields.jobOpeningId?.toString().trim() ?? "";
  const numId = rawId ? parseInt(rawId, 10) : NaN;
  if (Number.isInteger(numId)) {
    opening = await prisma.jobOpening.findUnique({ where: { id: numId } });
  } else if (fields.jobSlug) {
    opening = await prisma.jobOpening.findUnique({ where: { slug: fields.jobSlug } });
  }
  if (!opening || !opening.visible) return null;
  return opening;
}

export async function persistJobApplication({
  prisma,
  fields,
  opening,
  resumeKey,
  photoKey,
}: {
  prisma: DbClient;
  fields: CareerApplyFields;
  opening: { id: number; title: string };
  resumeKey: string;
  photoKey: string;
}): Promise<{ ok: true; id: string } | { ok: false; status: 409 | 500; error: string }> {
  try {
    const application = await prisma.jobApplication.create({
      data: {
        name: fields.name.trim(),
        email: fields.email.trim().toLowerCase(),
        phone: fields.phone.trim(),
        jobOpeningId: opening.id,
        jobTitle: opening.title,
        coverNote: fields.coverNote,
        resumeKey,
        photoKey,
        status: "new",
        fatherOrHusbandName: fields.fatherOrHusbandName,
        dateOfBirth: fields.dateOfBirth,
        gender: fields.gender,
        maritalStatus: fields.maritalStatus,
        cnic: fields.cnic,
        nationality: fields.nationality.trim(),
        currentAddress: fields.currentAddress.trim(),
        city: fields.city.trim(),
        highestQualification: fields.highestQualification,
        fieldOfStudy: fields.fieldOfStudy,
        institutionName: fields.institutionName,
        yearOfCompletion: fields.yearOfCompletion,
        yearsOfExperience: fields.yearsOfExperience,
        currentEmployer: fields.currentEmployer,
        currentJobTitle: fields.currentJobTitle,
        keySkills: fields.keySkills.trim(),
        noticePeriodDays: fields.noticePeriodDays,
        expectedSalary: fields.expectedSalary,
        availableFrom: fields.availableFrom,
        declarationAccepted: true,
      },
    });
    return { ok: true, id: application.id };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      return { ok: false, status: 409, error: ALREADY_APPLIED_MESSAGE };
    }
    console.error("[careers/apply] persist failed:", err);
    return { ok: false, status: 500, error: "Failed to save application" };
  }
}

export async function sendApplicationEmails({
  fields,
  openingTitle,
  applicationId,
}: {
  fields: CareerApplyFields;
  openingTitle: string;
  applicationId: string;
}) {
  try {
    const mailer = await getEmail();
    if (!mailer) {
      console.warn("[careers/apply] EMAIL binding unavailable; skipping send");
      return;
    }
    try {
      const last4 = cnicLast4(fields.cnic);
      const inboxUrl = `https://diqualia.com/admin/careers/applications?highlight=${applicationId}`;
      const subject = `New application: ${openingTitle} — ${fields.name}`;
      const html = `
        <p><b>Role:</b> ${esc(openingTitle)}</p>
        <p><b>Name:</b> ${esc(fields.name)}</p>
        <p><b>Email:</b> ${esc(fields.email)}</p>
        <p><b>Phone:</b> ${esc(fields.phone)}</p>
        <p><b>CNIC (last 4):</b> ${esc(last4)}</p>
        <p><b>City:</b> ${esc(fields.city)}</p>
        <p><b>Years of experience:</b> ${esc(String(fields.yearsOfExperience))}</p>
        <p><b>Notice period (days):</b> ${esc(String(fields.noticePeriodDays))}</p>
        <p><b>Expected salary (PKR):</b> ${esc(String(fields.expectedSalary))}</p>
        <p><a href="${esc(inboxUrl)}">Review in admin</a></p>
      `;
      const text = [
        `Role: ${openingTitle}`,
        `Name: ${fields.name}`,
        `Email: ${fields.email}`,
        `Phone: ${fields.phone}`,
        `CNIC (last 4): ${last4}`,
        `City: ${fields.city}`,
        `Years of experience: ${fields.yearsOfExperience}`,
        `Notice period (days): ${fields.noticePeriodDays}`,
        `Expected salary (PKR): ${fields.expectedSalary}`,
        `Review: ${inboxUrl}`,
      ].join("\n");

      await mailer.send({
        to: process.env.ADMIN_EMAIL!,
        from: { email: "noreply@diqualia.com", name: "DiQualia" },
        replyTo: fields.email,
        subject,
        html,
        text,
      });
    } catch (err) {
      console.error("[careers/apply] Email send failed:", err);
    }

    try {
      const subject = `We received your application — ${openingTitle}`;
      const html = `
        <p>Thank you for applying to <b>${esc(openingTitle)}</b> at DiQualia.</p>
        <p>We received your application and will reply with next steps.</p>
        <p>Reference: <code>${esc(applicationId)}</code></p>
      `;
      const text = [
        `Thank you for applying to ${openingTitle} at DiQualia.`,
        `We received your application and will reply with next steps.`,
        `Reference: ${applicationId}`,
      ].join("\n");

      await mailer.send({
        to: fields.email,
        from: { email: "noreply@diqualia.com", name: "DiQualia" },
        ...(process.env.ADMIN_EMAIL ? { replyTo: process.env.ADMIN_EMAIL } : {}),
        subject,
        html,
        text,
      });
    } catch (err) {
      console.error("[careers/apply] Applicant email failed:", err);
    }
  } catch (err) {
    console.error("[careers/apply] Email send failed:", err);
  }
}

export async function deleteUploadedKeys(storage: StorageClient, keys: string[]) {
  for (const key of keys) {
    try {
      await storage.deleteObject({ key });
    } catch {
      // ignore cleanup failure
    }
  }
}

export function validationError(details: unknown) {
  return NextResponse.json({ error: "Validation error", details }, { status: 400 });
}
