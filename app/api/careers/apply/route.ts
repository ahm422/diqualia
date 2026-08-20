import { NextResponse, type NextRequest } from "next/server";

import { cnicLast4 } from "@/lib/cnic";
import { getDb, getEmail, getEnv } from "@/lib/cloudflare-env";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  CareerApplyFieldsSchema,
  classifyPhoto,
  classifyResume,
  MIME_BY_EXT,
  PHOTO_MIME_BY_EXT,
} from "@/lib/schemas/public/career-apply";
import { getStorage } from "@/lib/storage";

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `careers:${ip}`, limit: 5, windowMs: 60_000 });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const websiteRaw = formText(formData, "website");
  if (websiteRaw.trim().length > 0) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const parsed = CareerApplyFieldsSchema.safeParse({
    name: formText(formData, "name"),
    email: formText(formData, "email"),
    phone: formText(formData, "phone"),
    jobSlug: formText(formData, "jobSlug"),
    jobOpeningId: formText(formData, "jobOpeningId"),
    coverNote: formText(formData, "coverNote"),
    website: formText(formData, "website"),
    fatherOrHusbandName: formText(formData, "fatherOrHusbandName"),
    dateOfBirth: formText(formData, "dateOfBirth"),
    gender: formText(formData, "gender"),
    maritalStatus: formText(formData, "maritalStatus"),
    cnic: formText(formData, "cnic"),
    nationality: formText(formData, "nationality") || "Pakistan",
    currentAddress: formText(formData, "currentAddress"),
    city: formText(formData, "city"),
    highestQualification: formText(formData, "highestQualification"),
    fieldOfStudy: formText(formData, "fieldOfStudy"),
    institutionName: formText(formData, "institutionName"),
    yearOfCompletion: formText(formData, "yearOfCompletion"),
    yearsOfExperience: formText(formData, "yearsOfExperience"),
    currentEmployer: formText(formData, "currentEmployer"),
    currentJobTitle: formText(formData, "currentJobTitle"),
    keySkills: formText(formData, "keySkills"),
    noticePeriodDays: formText(formData, "noticePeriodDays"),
    expectedSalary: formText(formData, "expectedSalary"),
    availableFrom: formText(formData, "availableFrom"),
    declarationAccepted: formData.get("declarationAccepted"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const fields = parsed.data;

  const resumeRaw = formData.get("resume");
  const resume = resumeRaw instanceof File ? resumeRaw : null;
  const resumeCheck = classifyResume(resume);
  if (!resume || !resumeCheck.ok) {
    const reason = resumeCheck.ok ? "required" : resumeCheck.reason;
    if (reason === "required") {
      return NextResponse.json({ error: "Resume is required" }, { status: 400 });
    }
    if (reason === "too_large") {
      return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
    }
    return NextResponse.json(
      { error: "File type not allowed. Accepted: PDF, DOC, DOCX." },
      { status: 400 },
    );
  }

  const photoRaw = formData.get("photo");
  const photo = photoRaw instanceof File ? photoRaw : null;
  const photoCheck = classifyPhoto(photo);
  if (!photo || !photoCheck.ok) {
    const reason = photoCheck.ok ? "required" : photoCheck.reason;
    if (reason === "required") {
      return NextResponse.json({ error: "Photograph is required" }, { status: 400 });
    }
    if (reason === "too_large") {
      return NextResponse.json({ error: "Photograph exceeds 2 MB limit" }, { status: 413 });
    }
    return NextResponse.json(
      { error: "Photograph type not allowed. Accepted: JPG, PNG, WebP." },
      { status: 400 },
    );
  }

  let opening = null;
  const numId = fields.jobOpeningId ? parseInt(fields.jobOpeningId, 10) : NaN;
  if (Number.isInteger(numId)) {
    opening = await prisma.jobOpening.findUnique({ where: { id: numId } });
  } else if (fields.jobSlug) {
    opening = await prisma.jobOpening.findUnique({ where: { slug: fields.jobSlug } });
  }
  if (!opening || !opening.visible) {
    return NextResponse.json({ error: "This opening is not available" }, { status: 400 });
  }

  const env = await getEnv();
  if (!env.R2) {
    console.error("[careers/apply] R2 binding not configured");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const storage = getStorage(env.R2);
  const resumeKey = `resumes/${crypto.randomUUID()}.${resumeCheck.ext}`;
  const photoKey = `photos/${crypto.randomUUID()}.${photoCheck.ext}`;
  const resumeType = MIME_BY_EXT[resumeCheck.ext][0];
  const photoType = PHOTO_MIME_BY_EXT[photoCheck.ext][0];

  try {
    await storage.uploadObject({
      key: resumeKey,
      body: Buffer.from(await resume.arrayBuffer()),
      contentType: resumeType,
    });
  } catch (err) {
    console.error("[careers/apply] R2 resume error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  try {
    await storage.uploadObject({
      key: photoKey,
      body: Buffer.from(await photo.arrayBuffer()),
      contentType: photoType,
    });
  } catch (err) {
    console.error("[careers/apply] R2 photo error:", err);
    try {
      await storage.deleteObject({ key: resumeKey });
    } catch {
      // ignore cleanup failure
    }
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  let application;
  try {
    application = await prisma.jobApplication.create({
      data: {
        name: fields.name.trim(),
        email: fields.email.trim(),
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
  } catch (err) {
    console.error("[careers/apply] persist failed:", err);
    try {
      await storage.deleteObject({ key: resumeKey });
    } catch {
      // ignore cleanup failure
    }
    try {
      await storage.deleteObject({ key: photoKey });
    } catch {
      // ignore cleanup failure
    }
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }

  try {
    const mailer = await getEmail();
    if (!mailer) {
      console.warn("[careers/apply] EMAIL binding unavailable; skipping send");
    } else {
      try {
        const last4 = cnicLast4(fields.cnic);
        const inboxUrl = `https://diqualia.com/admin/careers/applications?highlight=${application.id}`;
        const subject = `New application: ${opening.title} — ${fields.name}`;
        const html = `
        <p><b>Role:</b> ${esc(opening.title)}</p>
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
          `Role: ${opening.title}`,
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
        const subject = `We received your application — ${opening.title}`;
        const html = `
        <p>Thank you for applying to <b>${esc(opening.title)}</b> at DiQualia.</p>
        <p>We received your application and will reply with next steps.</p>
        <p>Reference: <code>${esc(application.id)}</code></p>
      `;
        const text = [
          `Thank you for applying to ${opening.title} at DiQualia.`,
          `We received your application and will reply with next steps.`,
          `Reference: ${application.id}`,
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
    }
  } catch (err) {
    console.error("[careers/apply] Email send failed:", err);
  }

  return NextResponse.json({ ok: true, id: application.id });
}
