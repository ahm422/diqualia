import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { SubmissionsTable } from "./SubmissionsTable";

export default async function SubmissionsPage() {
  const prisma = await getDb();
  await requireAdmin();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Submissions"
        description="Form submissions from the contact page"
      />
      <SubmissionsTable initialLeads={leads} />
    </div>
  );
}
