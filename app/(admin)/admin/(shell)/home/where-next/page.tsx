import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { WhereNextEditor } from "./WhereNextEditor";

export default async function HomeWhereNextAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const whereNext = await prisma.homeWhereNext.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Where Next"
        description="Bottom homepage CTA: eyebrow, headline, body, and button."
        previewHref="/#where-next"
      />
      <WhereNextEditor initial={whereNext} />
    </div>
  );
}
