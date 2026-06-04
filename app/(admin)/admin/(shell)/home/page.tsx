import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

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
      <h1 className="font-sans text-2xl font-medium mb-8">Home Page</h1>
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
