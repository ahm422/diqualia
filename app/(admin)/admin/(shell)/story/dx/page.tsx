import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { DoubleExperienceEditor } from "./DoubleExperienceEditor";

export default async function StoryDxAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const storyPage = await prisma.storyPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Double Experience"
        description="The two Double Experience cards and tagline on /story#dx."
        previewHref="/story#dx"
      />
      <DoubleExperienceEditor initial={storyPage} />
    </div>
  );
}
