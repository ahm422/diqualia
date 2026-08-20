import { NextResponse, type NextRequest } from "next/server";

import { getDb, getEmail, getEnv } from "@/lib/cloudflare-env";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  CareerApplyFieldsSchema,
  classifyResume,
  MIME_BY_EXT,
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

  const parsed = CareerApplyFieldsSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    jobSlug: String(formData.get("jobSlug") ?? ""),
    jobOpeningId: String(formData.get("jobOpeningId") ?? ""),
    coverNote: String(formData.get("coverNote") ?? ""),
    website: String(formData.get("website") ?? ""),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { website, name, email, phone, jobSlug, jobOpeningId, coverNote } = parsed.data;

  if (website && website.trim().length > 0) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

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
  const ext = resumeCheck.ext;

  let opening = null;
  const numId = jobOpeningId ? parseInt(jobOpeningId, 10) : NaN;
  if (Number.isInteger(numId)) {
    opening = await prisma.jobOpening.findUnique({ where: { id: numId } });
  } else if (jobSlug) {
    opening = await prisma.jobOpening.findUnique({ where: { slug: jobSlug } });
  }
  if (!opening || !opening.visible) {
    return NextResponse.json({ error: "This opening is not available" }, { status: 400 });
  }

  const env = await getEnv();
  if (!env.R2) {
    console.error("[careers/apply] R2 binding not configured");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const key = `resumes/${crypto.randomUUID()}.${ext}`;
  const body = Buffer.from(await resume.arrayBuffer());
  const storage = getStorage(env.R2);
  const contentType = MIME_BY_EXT[ext][0];

  try {
    await storage.uploadObject({ key, body, contentType });
  } catch (err) {
    console.error("[careers/apply] R2 error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  let application;
  try {
    application = await prisma.jobApplication.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() ? phone.trim() : null,
        jobOpeningId: opening.id,
        jobTitle: opening.title,
        coverNote: coverNote?.trim() ? coverNote.trim() : null,
        resumeKey: key,
        status: "new",
      },
    });
  } catch (err) {
    console.error("[careers/apply] persist failed:", err);
    try {
      await storage.deleteObject({ key });
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
        const subject = `New application: ${opening.title} — ${name}`;
        const html = `
        <p><b>Role:</b> ${esc(opening.title)}</p>
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Phone:</b> ${esc(phone?.trim() ? phone : "—")}</p>
        <p><b>Cover note:</b></p>
        <p>${esc(coverNote?.trim() ? coverNote : "—").replace(/\n/g, "<br>")}</p>
      `;
        const text = [
          `Role: ${opening.title}`,
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone?.trim() ? phone : "—"}`,
          `Cover note:`,
          coverNote?.trim() ? coverNote : "—",
        ].join("\n");

        await mailer.send({
          to: process.env.ADMIN_EMAIL!,
          from: { email: "noreply@diqualia.com", name: "DiQualia" },
          replyTo: email,
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
          to: email,
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
