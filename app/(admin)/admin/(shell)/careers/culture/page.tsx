import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { CultureEditor } from "./CultureEditor";

export default async function CareersCultureAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const careerPage = await prisma.careerPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Culture"
        description="The Culture block on /careers. Benefits sit in the same section on the live page."
        previewHref="/careers#culture"
      />
      <CultureEditor initial={careerPage} />
    </div>
  );
}
