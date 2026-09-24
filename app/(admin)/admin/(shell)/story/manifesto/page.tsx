import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { ManifestoEditor } from "./ManifestoEditor";

export default async function StoryManifestoAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const storyPage = await prisma.storyPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Manifesto"
        description="The DiQualia Manifesto list on the Story page."
        previewHref="/story#manifesto"
      />
      <ManifestoEditor initial={storyPage} />
    </div>
  );
}
