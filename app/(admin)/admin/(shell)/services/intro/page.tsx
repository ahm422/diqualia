import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { IntroEditor } from "./IntroEditor";

export default async function ServicesIntroAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const page = await prisma.servicesPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Page Intro"
        description="Services page hero (headline, body, stats) and the gold contact strip at the bottom of /services."
        previewHref="/services"
      />
      <IntroEditor initial={page} />
    </div>
  );
}
