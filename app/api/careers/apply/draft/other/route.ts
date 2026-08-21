import { NextResponse, type NextRequest } from "next/server";

import {
  careersDraftRateLimit,
  deleteUploadedKeys,
  formText,
  validationError,
} from "@/lib/careers/apply-shared";
import { DraftTokenSchema, findInProgressDraft, touchDraft } from "@/lib/careers/draft";
import { getDb, getEnv } from "@/lib/cloudflare-env";
import {
  CareerApplyOtherSchema,
  classifyPhoto,
  classifyResume,
  MIME_BY_EXT,
  PHOTO_MIME_BY_EXT,
} from "@/lib/schemas/public/career-apply";
import { getStorage } from "@/lib/storage";

export async function PUT(request: NextRequest) {
  const limited = careersDraftRateLimit(request);
  if (limited) return limited;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const tokenParsed = DraftTokenSchema.safeParse(formText(formData, "token"));
  if (!tokenParsed.success) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const parsed = CareerApplyOtherSchema.safeParse({
    keySkills: formText(formData, "keySkills"),
    noticePeriodDays: formText(formData, "noticePeriodDays"),
    expectedSalary: formText(formData, "expectedSalary"),
    availableFrom: formText(formData, "availableFrom"),
    declarationAccepted: formData.get("declarationAccepted"),
  });
  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const prisma = await getDb();
  const draft = await findInProgressDraft(prisma, tokenParsed.data);
  if (!draft) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const existingResumeKey = draft.other?.resumeKey ?? null;
  const existingPhotoKey = draft.other?.photoKey ?? null;

  const resumeRaw = formData.get("resume");
  const resume = resumeRaw instanceof File && resumeRaw.size > 0 ? resumeRaw : null;
  const photoRaw = formData.get("photo");
  const photo = photoRaw instanceof File && photoRaw.size > 0 ? photoRaw : null;

  let resumeKey = existingResumeKey;
  let photoKey = existingPhotoKey;
  const uploaded: string[] = [];

  const env = await getEnv();
  if ((resume || photo) && !env.R2) {
    console.error("[careers/apply] R2 binding not configured");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
  const storage = env.R2 ? getStorage(env.R2) : null;

  if (resume) {
    const resumeCheck = classifyResume(resume);
    if (!resumeCheck.ok) {
      if (resumeCheck.reason === "too_large") {
        return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
      }
      return NextResponse.json(
        { error: "File type not allowed. Accepted: PDF, DOC, DOCX." },
        { status: 400 },
      );
    }
    if (!storage) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    resumeKey = `resumes/${crypto.randomUUID()}.${resumeCheck.ext}`;
    try {
      await storage.uploadObject({
        key: resumeKey,
        body: Buffer.from(await resume.arrayBuffer()),
        contentType: MIME_BY_EXT[resumeCheck.ext][0],
      });
      uploaded.push(resumeKey);
    } catch (err) {
      console.error("[careers/apply] R2 resume error:", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  if (photo) {
    const photoCheck = classifyPhoto(photo);
    if (!photoCheck.ok) {
      if (storage) await deleteUploadedKeys(storage, uploaded);
      if (photoCheck.reason === "too_large") {
        return NextResponse.json({ error: "Photograph exceeds 2 MB limit" }, { status: 413 });
      }
      return NextResponse.json(
        { error: "Photograph type not allowed. Accepted: JPG, PNG, WebP." },
        { status: 400 },
      );
    }
    if (!storage) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    photoKey = `photos/${crypto.randomUUID()}.${photoCheck.ext}`;
    try {
      await storage.uploadObject({
        key: photoKey,
        body: Buffer.from(await photo.arrayBuffer()),
        contentType: PHOTO_MIME_BY_EXT[photoCheck.ext][0],
      });
      uploaded.push(photoKey);
    } catch (err) {
      console.error("[careers/apply] R2 photo error:", err);
      await deleteUploadedKeys(storage, uploaded);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  if (!resumeKey) {
    if (storage) await deleteUploadedKeys(storage, uploaded);
    return NextResponse.json({ error: "Resume is required" }, { status: 400 });
  }
  if (!photoKey) {
    if (storage) await deleteUploadedKeys(storage, uploaded);
    return NextResponse.json({ error: "Photograph is required" }, { status: 400 });
  }

  const fields = parsed.data;
  try {
    await prisma.careerApplicationDraftOther.upsert({
      where: { draftToken: draft.token },
      create: {
        draftToken: draft.token,
        keySkills: fields.keySkills,
        noticePeriodDays: fields.noticePeriodDays,
        expectedSalary: fields.expectedSalary,
        availableFrom: fields.availableFrom,
        resumeKey,
        photoKey,
        declarationAccepted: true,
      },
      update: {
        keySkills: fields.keySkills,
        noticePeriodDays: fields.noticePeriodDays,
        expectedSalary: fields.expectedSalary,
        availableFrom: fields.availableFrom,
        resumeKey,
        photoKey,
        declarationAccepted: true,
      },
    });
    await touchDraft(prisma, draft.token);
  } catch (err) {
    console.error("[careers/apply] draft other persist failed:", err);
    if (storage) await deleteUploadedKeys(storage, uploaded);
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }

  if (storage) {
    const stale: string[] = [];
    if (resume && existingResumeKey && existingResumeKey !== resumeKey) stale.push(existingResumeKey);
    if (photo && existingPhotoKey && existingPhotoKey !== photoKey) stale.push(existingPhotoKey);
    if (stale.length > 0) await deleteUploadedKeys(storage, stale);
  }

  return NextResponse.json({ ok: true, resumeUploaded: true, photoUploaded: true });
}
