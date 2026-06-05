import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

import { SubmissionsTable } from "./SubmissionsTable";

export default async function SubmissionsPage() {
  await requireAdmin();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Submissions</h1>
      <SubmissionsTable initialLeads={leads} />
    </div>
  );
}
