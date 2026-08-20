import "server-only";

import { NextResponse } from "next/server";

import { JOB_APPLICATION_ADMIN_SELECT } from "@/lib/admin/job-application-view";
import { requirePermissionApi } from "@/lib/auth/require-admin-api";
import { getDb } from "@/lib/cloudflare-env";

function csvCell(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET() {
  const prisma = await getDb();
  const session = await requirePermissionApi("applications.pii");
  if (session instanceof NextResponse) return session;

  const applications = await prisma.jobApplication.findMany({
    orderBy: { submittedAt: "desc" },
    select: JOB_APPLICATION_ADMIN_SELECT,
  });

  const headers = [
    "id",
    "name",
    "email",
    "phone",
    "jobTitle",
    "status",
    "submittedAt",
    "cnic",
    "nationality",
    "city",
    "dateOfBirth",
    "gender",
    "yearsOfExperience",
    "noticePeriodDays",
    "expectedSalary",
    "availableFrom",
    "resumeKey",
    "photoKey",
  ];

  const lines = [headers.join(",")];
  for (const row of applications) {
    lines.push(
      [
        row.id,
        row.name,
        row.email,
        row.phone,
        row.jobTitle,
        row.status,
        row.submittedAt.toISOString(),
        row.cnic,
        row.nationality,
        row.city,
        row.dateOfBirth,
        row.gender,
        row.yearsOfExperience,
        row.noticePeriodDays,
        row.expectedSalary,
        row.availableFrom,
        row.resumeKey,
        row.photoKey,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="job-applications.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
