import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function CareersHeroAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const careerPage = await prisma.careerPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of the Careers page: eyebrow, two-line headline, and body."
        previewHref="/careers#hero"
      />
      <HeroEditor initial={careerPage} />
    </div>
  );
}
