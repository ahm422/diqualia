import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { lookupExistingApplication } from "@/lib/careers/apply-check";
import { getClientIp } from "@/lib/careers/apply-shared";
import { getDb } from "@/lib/cloudflare-env";
import { normalizeCnic } from "@/lib/cnic";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

/**
 * GET /api/careers/apply/check?openingId=<int>&email=<addr>&cnic=<digits|dashed>
 *   -> { email: boolean, cnic: boolean }
 *
 * Lets the form warn a returning applicant on the Personal step, before they
 * fill four steps. At least one of `email` / `cnic` must be present and valid;
 * each is normalized server-side to the stored/unique-constrained form. The
 * response is boolean-only — the submitted email/CNIC is never echoed back.
 */

const emailSchema = z.string().email().max(254);

export async function GET(request: NextRequest) {
  const rl = checkRateLimit({
    key: `careers-check:${getClientIp(request)}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);

  const { searchParams } = new URL(request.url);
  const openingId = Number.parseInt(searchParams.get("openingId") ?? "", 10);
  const cnic = normalizeCnic(searchParams.get("cnic"));

  const emailRaw = searchParams.get("email")?.trim().toLowerCase() ?? "";
  const parsedEmail = emailSchema.safeParse(emailRaw);
  const email = parsedEmail.success ? parsedEmail.data : null;

  if (!Number.isInteger(openingId) || openingId <= 0 || (!email && !cnic)) {
    return NextResponse.json({ email: false, cnic: false });
  }

  const prisma = await getDb();
  return NextResponse.json(
    await lookupExistingApplication({ prisma, jobOpeningId: openingId, email, cnic }),
  );
}
