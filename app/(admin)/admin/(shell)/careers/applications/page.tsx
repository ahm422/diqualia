import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { CareersSubNav } from "../CareersSubNav";
import { ApplicationsTable } from "./ApplicationsTable";

export default async function JobApplicationsAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const applications = await prisma.jobApplication.findMany({
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Applications"
        description="Inbox for /careers apply submissions"
      />
      <CareersSubNav />
      <ApplicationsTable initialApplications={applications} />
    </div>
  );
}
