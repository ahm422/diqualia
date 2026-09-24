import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { getDb, getEnv } from "@/lib/cloudflare-env";
import { requireApplicantApi } from "@/lib/portal/require-applicant";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const RESUME_KEY_RE = /^resumes\/[a-f0-9-]+\.(pdf|doc|docx)$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const prisma = await getDb();
  const session = await requireApplicantApi();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const application = await prisma.jobApplication.findUnique({ where: { id } });
  // Ownership by lower-cased email (v1 join); applicantUserId is the backfill.
  if (
    !application ||
    (application.email !== session.email && application.applicantUserId !== session.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!RESUME_KEY_RE.test(application.resumeKey)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const env = await getEnv();
  if (!env.R2) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const object = await env.R2.get(application.resumeKey);
  if (!object) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bytes = await object.arrayBuffer();
  const ext = application.resumeKey.split(".").pop() ?? "bin";
  const filename = `resume-${application.id}.${ext}`;
  const contentType = object.httpMetadata?.contentType ?? "application/octet-stream";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
