import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function ProcessHeroAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const initialPage = await prisma.processPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of How We Work: eyebrow, three-line headline, and body."
        previewHref="/process#hero"
      />
      <HeroEditor initial={initialPage} />
    </div>
  );
}
