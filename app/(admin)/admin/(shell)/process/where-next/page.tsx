import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { WhereNextEditor } from "./WhereNextEditor";

export default async function ProcessWhereNextAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const initialPage = await prisma.processPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Where Next"
        description="Bottom CTA on How We Work: eyebrow, two-line title, and body."
        previewHref="/process#where-next"
      />
      <WhereNextEditor initial={initialPage} />
    </div>
  );
}
