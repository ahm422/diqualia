import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { BenefitsEditor } from "./BenefitsEditor";

export default async function CareersBenefitsAdminPage() {
  const prisma = await getDb();
  await requirePermission("cms.view");

  const careerPage = await prisma.careerPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Benefits"
        description="Benefit list under Culture on /careers (same section on the live page)."
        previewHref="/careers#benefits"
      />
      <BenefitsEditor initial={careerPage} />
    </div>
  );
}
