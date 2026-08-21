import { NextResponse, type NextRequest } from "next/server";

import {
  careersSubmitRateLimit,
  deleteUploadedKeys,
  findVisibleOpening,
  formText,
  persistJobApplication,
  sendApplicationEmails,
  validationError,
} from "@/lib/careers/apply-shared";
import { getDb, getEnv } from "@/lib/cloudflare-env";
import {
  CareerApplyFieldsSchema,
  classifyPhoto,
  classifyResume,
  MIME_BY_EXT,
  PHOTO_MIME_BY_EXT,
} from "@/lib/schemas/public/career-apply";
import { getStorage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const limited = careersSubmitRateLimit(request);
  if (limited) return limited;

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
    return validationError(parsed.error.flatten());
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

  const opening = await findVisibleOpening(prisma, fields);
  if (!opening) {
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
    await deleteUploadedKeys(storage, [resumeKey]);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const persisted = await persistJobApplication({
    prisma,
    fields,
    opening,
    resumeKey,
    photoKey,
  });
  if (!persisted.ok) {
    await deleteUploadedKeys(storage, [resumeKey, photoKey]);
    return NextResponse.json({ error: persisted.error }, { status: persisted.status });
  }

  await sendApplicationEmails({
    fields,
    openingTitle: opening.title,
    applicationId: persisted.id,
  });

  return NextResponse.json({ ok: true, id: persisted.id });
}
