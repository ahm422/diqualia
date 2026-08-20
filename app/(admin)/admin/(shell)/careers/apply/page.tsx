import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { ApplyEditor } from "./ApplyEditor";

export default async function CareersApplyAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const careerPage = await prisma.careerPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Apply instructions"
        description="Bottom apply band on /careers."
        previewHref="/careers#apply"
      />
      <ApplyEditor initial={careerPage} />
    </div>
  );
}
