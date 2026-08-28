import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function IndustriesHeroAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const page = await prisma.industriesPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of the Industries page: eyebrow, two-line headline, and body."
        previewHref="/industries#hero"
      />
      <HeroEditor initial={page} />
    </div>
  );
}
