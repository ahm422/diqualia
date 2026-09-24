import { Suspense } from "react";

import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { SubmissionsTable } from "./SubmissionsTable";

export default async function SubmissionsPage() {
  const prisma = await getDb();
  await requirePermission("contact.view");

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Submissions"
        description="Inbox for contact-form submissions from /contact."
      />
      <Suspense fallback={<p className="text-sm text-[var(--diq_mid)]">Loading…</p>}>
        <SubmissionsTable initialLeads={leads} />
      </Suspense>
    </div>
  );
}
