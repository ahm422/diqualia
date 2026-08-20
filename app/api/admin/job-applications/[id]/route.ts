import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { JOB_APPLICATION_ADMIN_SELECT, toJobApplicationAdminView } from "@/lib/admin/job-application-view";
import { requireAdminApi, requirePermissionApi } from "@/lib/auth/require-admin-api";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { jobApplicationPatchSchema } from "@/lib/schemas/admin/career";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requireAdminApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id },
    select: JOB_APPLICATION_ADMIN_SELECT,
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    toJobApplicationAdminView(application, hasPermission(session, "applications.pii")),
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requirePermissionApi("content.edit");
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = jobApplicationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status: parsed.data.status },
      select: JOB_APPLICATION_ADMIN_SELECT,
    });
    return NextResponse.json(
      toJobApplicationAdminView(application, hasPermission(session, "applications.pii")),
    );
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
