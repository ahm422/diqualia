import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { ExploreEditor } from "./ExploreEditor";

export default async function HomeExploreAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const [exploreSection, exploreCards] = await Promise.all([
    prisma.homeExploreSection.findUnique({ where: { id: 1 } }),
    prisma.homeExploreCard.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Explore"
        description="The Explore heading and link cards on the homepage (/#explore)."
        previewHref="/#explore"
      />
      <ExploreEditor initialSection={exploreSection} initialCards={exploreCards} />
    </div>
  );
}
