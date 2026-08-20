import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { WhereNextEditor } from "./WhereNextEditor";

export default async function AboutWhereNextAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const whereNext = await prisma.aboutWhereNext.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Where Next"
        description="Bottom About-page CTA: eyebrow, headline, and two buttons."
        previewHref="/about#where-next"
      />
      <WhereNextEditor initial={whereNext} />
    </div>
  );
}
