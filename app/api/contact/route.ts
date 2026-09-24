import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getDb, getEmail } from "@/lib/cloudflare-env";
import { sendEmail } from "@/lib/email";
import { ContactBodySchema } from "@/lib/schemas/public/contact";

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
  const rl = checkRateLimit({ key: `contact:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ContactBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { website, email, name, message, source } = parsed.data;

  if (website && website.trim().length > 0) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        email:   email?.trim()   ? email.trim()   : null,
        name:    name?.trim()    ? name.trim()    : null,
        message: message?.trim() ? message.trim() : null,
        source:  source?.trim()  ? source.trim()  : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  // Send admin notification — best-effort; lead is already saved
  try {
    const mailer = await getEmail();
    if (!mailer) {
      console.warn("[contact] EMAIL binding unavailable; skipping send");
    } else {
      const subject = `New contact: ${name || email || "unknown"}`;
      const html = `
        <p><b>Name:</b> ${esc(name ?? "—")}</p>
        <p><b>Email:</b> ${esc(email ?? "—")}</p>
        <p><b>Message:</b></p>
        <p>${esc(message ?? "—").replace(/\n/g, "<br>")}</p>
      `;
      const text = [
        `Name: ${name ?? "—"}`,
        `Email: ${email ?? "—"}`,
        `Message:`,
        message ?? "—",
      ].join("\n");

      await sendEmail(mailer, {
        to: process.env.ADMIN_EMAIL!,
        ...(email ? { replyTo: email } : {}),
        subject,
        html,
        text,
      });
    }
  } catch (err) {
    console.error("[contact] Email send failed:", err);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
