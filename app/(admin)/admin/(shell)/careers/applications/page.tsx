import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";
import { jobApplicationStatusEnum } from "@/lib/schemas/admin/career";

import { ApplicationsTable } from "./ApplicationsTable";

export default async function JobApplicationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ highlight?: string; status?: string }>;
}) {
  const prisma = await getDb();
  await requireAdmin();
  const sp = await searchParams;
  const statusParsed = sp.status ? jobApplicationStatusEnum.safeParse(sp.status) : null;
  const status = statusParsed?.success ? statusParsed.data : undefined;

  const applications = await prisma.jobApplication.findMany({
    orderBy: { submittedAt: "desc" },
    where: status ? { status } : undefined,
  });

  return (
    <div>
      <AdminPageHeader
        title="Applications"
        description="Inbox for /careers apply submissions"
      />
      <Suspense fallback={<p className="text-sm text-[var(--diq_mid)]">Loading…</p>}>
        <ApplicationsTable initialApplications={applications} initialStatus={status ?? ""} />
      </Suspense>
    </div>
  );
}
