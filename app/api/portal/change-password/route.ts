import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/cloudflare-env";
import { revokeAllPortalRefreshTokens } from "@/lib/portal/portal-refresh-tokens";
import { requireApplicantApi } from "@/lib/portal/require-applicant";

const BodySchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z.string().min(8).max(1024),
});

export async function POST(request: NextRequest) {
  const prisma = await getDb();
  const session = await requireApplicantApi();
  if (session instanceof NextResponse) return session;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const user = await prisma.applicantUser.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await prisma.applicantUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
    },
  });
  // Force other sessions to re-authenticate.
  await revokeAllPortalRefreshTokens(prisma, user.id);

  return NextResponse.json({ ok: true });
}
