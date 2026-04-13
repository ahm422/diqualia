import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { checkRateLimit } from "@/lib/rateLimit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const LeadBodySchema = z
  .object({
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
    name: z.string().trim().min(1).max(200).optional().or(z.literal("")),
    message: z.string().trim().min(1).max(5000).optional().or(z.literal("")),
    source: z.string().trim().min(1).max(100).optional().or(z.literal("")),
    // Honeypot (bots fill it)
    website: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    const hasEmail = typeof val.email === "string" && val.email.trim().length > 0;
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

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `leads:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadBodySchema.safeParse(json);
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

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      email: email?.trim() ? email.trim() : null,
      name: name?.trim() ? name.trim() : null,
      message: message?.trim() ? message.trim() : null,
      source: source?.trim() ? source.trim() : null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

