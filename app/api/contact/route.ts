import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

const ContactBodySchema = z
  .object({
    email:   z.string().trim().email().max(254).optional().or(z.literal("")),
    name:    z.string().trim().min(1).max(200).optional().or(z.literal("")),
    message: z.string().trim().min(1).max(5000).optional().or(z.literal("")),
    source:  z.string().trim().min(1).max(100).optional().or(z.literal("")),
    website: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    const hasEmail   = typeof val.email   === "string" && val.email.trim().length   > 0;
    const hasMessage = typeof val.message === "string" && val.message.trim().length > 0;
    if (!hasEmail && !hasMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide at least one of email or message.",
        path: ["email"],
      });
    }
  });

function getClientIp(request: NextRequest) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `contact:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from:    process.env.RESEND_FROM!,
      to:      process.env.ADMIN_EMAIL!,
      replyTo: email || undefined,
      subject: `New contact: ${name || email || "unknown"}`,
      html: `
        <p><b>Name:</b> ${esc(name ?? "—")}</p>
        <p><b>Email:</b> ${esc(email ?? "—")}</p>
        <p><b>Message:</b></p>
        <p>${esc(message ?? "—").replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch (err) {
    console.error("[contact] Resend failed:", err);
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
