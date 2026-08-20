import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { ExploreEditor } from "./ExploreEditor";

export default async function HomeExploreAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const [exploreSection, exploreCards] = await Promise.all([
    prisma.homeExploreSection.findUnique({ where: { id: 1 } }),
    prisma.homeExploreCard.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Explore Cards"
        description="Explore heading and cards stored in the CMS. They are not currently rendered on the homepage — the live site shows About, services, process, and industries instead."
        previewHref="/"
      />
      <ExploreEditor initialSection={exploreSection} initialCards={exploreCards} />
    </div>
  );
}
