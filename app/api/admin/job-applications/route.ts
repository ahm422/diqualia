import "server-only";

import { NextResponse } from "next/server";

import { JOB_APPLICATION_ADMIN_SELECT, toJobApplicationAdminView } from "@/lib/admin/job-application-view";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { jobApplicationStatusEnum } from "@/lib/schemas/admin/career";

export async function GET(request: Request) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") === "asc" ? ("asc" as const) : ("desc" as const);
  const statusRaw = searchParams.get("status");
  const statusParsed = statusRaw ? jobApplicationStatusEnum.safeParse(statusRaw) : null;
  const status = statusParsed?.success ? statusParsed.data : undefined;

  const applications = await prisma.jobApplication.findMany({
    orderBy: { submittedAt: sort },
    where: status ? { status } : undefined,
    select: JOB_APPLICATION_ADMIN_SELECT,
  });

  const canRevealPii = hasPermission(session, "applications.pii");
  return NextResponse.json(applications.map((row) => toJobApplicationAdminView(row, canRevealPii)));
}
