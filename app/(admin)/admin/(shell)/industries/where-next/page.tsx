import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { WhereNextEditor } from "./WhereNextEditor";

export default async function IndustriesWhereNextAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const page = await prisma.industriesPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Where Next"
        description="Bottom CTA on the Industries page."
        previewHref="/industries#where-next"
      />
      <WhereNextEditor initial={page} />
    </div>
  );
}
