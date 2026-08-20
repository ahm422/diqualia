import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function AboutHeroAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const hero = await prisma.aboutHero.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of the About page: eyebrow, headline, and body copy."
        previewHref="/about#hero"
      />
      <HeroEditor initial={hero} />
    </div>
  );
}
