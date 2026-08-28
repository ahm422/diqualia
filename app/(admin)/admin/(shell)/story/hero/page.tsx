import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function StoryHeroAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const storyPage = await prisma.storyPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of the Story page: eyebrow, three-line headline, and body."
        previewHref="/story#hero"
      />
      <HeroEditor initial={storyPage} />
    </div>
  );
}
