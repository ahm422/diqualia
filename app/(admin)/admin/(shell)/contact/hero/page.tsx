import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { HeroEditor } from "./HeroEditor";

export default async function ContactHeroAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const contactPage = await prisma.contactPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Hero"
        description="Opening of the Contact page: eyebrow, two-line headline, and body."
        previewHref="/contact#hero"
      />
      <HeroEditor initial={contactPage} />
    </div>
  );
}
