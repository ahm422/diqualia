import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { StoryPageEditor } from "./StoryPageEditor";

export default async function StoryAdminPage() {
  const prisma = getDb();
  await requireAdmin();

  const storyPage = await prisma.storyPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Story Page"
        description="Hero, Double Experience cards, and manifesto"
      />
      <StoryPageEditor initialData={storyPage} />
    </div>
  );
}
