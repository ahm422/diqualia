import { NextResponse, type NextRequest } from "next/server";

import { getClientIp } from "@/lib/careers/apply-shared";
import { getDb } from "@/lib/cloudflare-env";
import { normalizeCnic } from "@/lib/cnic";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

/**
 * GET /api/careers/apply/check?openingId=<int>&cnic=<digits|dashed>
 * -> { applied: boolean }
 *
 * Lets the form warn a returning applicant before they fill five steps. No PII
 * in the response; the CNIC is normalized server-side and never echoed.
 */
export async function GET(request: NextRequest) {
  const rl = checkRateLimit({
    key: `careers-check:${getClientIp(request)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) return rateLimitResponse(rl.resetAtMs);

  const { searchParams } = new URL(request.url);
  const openingId = Number.parseInt(searchParams.get("openingId") ?? "", 10);
  const cnic = normalizeCnic(searchParams.get("cnic"));

  if (!Number.isInteger(openingId) || !cnic) {
    return NextResponse.json({ applied: false });
  }

  const prisma = await getDb();
  const existing = await prisma.jobApplication.findFirst({
    where: { jobOpeningId: openingId, cnic },
    select: { id: true },
  });

  return NextResponse.json({ applied: existing != null });
}
