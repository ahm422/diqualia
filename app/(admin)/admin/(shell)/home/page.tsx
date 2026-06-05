import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { HomePageEditor } from "./HomePageEditor";

export default async function HomePage() {
  await requireAdmin();

  const [hero, marqueeItems, exploreSection, exploreCards, whereNext] = await Promise.all([
    prisma.homeHero.findUnique({ where: { id: 1 } }),
    prisma.homeMarqueeItem.findMany({ orderBy: { order: "asc" } }),
    prisma.homeExploreSection.findUnique({ where: { id: 1 } }),
    prisma.homeExploreCard.findMany({ orderBy: { order: "asc" } }),
    prisma.homeWhereNext.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="Home Page" description="Hero, marquee, explore cards, and Where Next section" />
      <HomePageEditor
        initialHero={hero}
        initialMarquee={marqueeItems}
        initialExploreSection={exploreSection}
        initialExploreCards={exploreCards}
        initialWhereNext={whereNext}
      />
    </div>
  );
}
