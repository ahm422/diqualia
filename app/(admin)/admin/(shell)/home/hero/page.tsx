import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function HomeHeroAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const hero = await prisma.homeHero.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of the homepage: headline, body, two buttons, and the three stats in the Intelligence Panel."
        previewHref="/#hero"
      />
      <HeroEditor initial={hero} />
    </div>
  );
}
