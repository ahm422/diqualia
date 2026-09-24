import { Suspense } from "react";

import { requirePermission } from "@/lib/auth/require-admin";
import { hasPermission } from "@/lib/auth/session";
import { getDb } from "@/lib/cloudflare-env";
import { JOB_APPLICATION_ADMIN_SELECT, toJobApplicationAdminView } from "@/lib/admin/job-application-view";
import { AdminPageHeader } from "@/components/admin";
import { jobApplicationStatusEnum } from "@/lib/schemas/admin/career";

import { ApplicationsTable } from "./ApplicationsTable";

export default async function JobApplicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ highlight?: string; status?: string }>;
}) {
  const prisma = await getDb();
  const session = await requirePermission("careers.applications.view");
  const sp = await searchParams;
  const statusParsed = sp.status ? jobApplicationStatusEnum.safeParse(sp.status) : null;
  const status = statusParsed?.success ? statusParsed.data : undefined;
  const canRevealPii = hasPermission(session, "applications.pii");

  const applications = await prisma.jobApplication.findMany({
    orderBy: { submittedAt: "desc" },
    where: status ? { status } : undefined,
    select: JOB_APPLICATION_ADMIN_SELECT,
  });

  return (
    <div>
      <AdminPageHeader
        title="Applications"
        description="Inbox for /careers apply submissions."
      />
      <Suspense fallback={<p className="text-sm text-[var(--diq_mid)]">Loading…</p>}>
        <ApplicationsTable
          initialApplications={applications.map((row) => toJobApplicationAdminView(row, canRevealPii))}
          initialStatus={status ?? ""}
          canRevealPii={canRevealPii}
        />
      </Suspense>
    </div>
  );
}
