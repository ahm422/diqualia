import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

import { StoryPageEditor } from "./StoryPageEditor";

export default async function StoryAdminPage() {
  await requireAdmin();

  const storyPage = await prisma.storyPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Story</h1>
      <StoryPageEditor initialData={storyPage} />
    </div>
  );
}
