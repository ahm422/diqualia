import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { StoryPageEditor } from "./StoryPageEditor";

export default async function StoryAdminPage() {
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
