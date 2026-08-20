import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { CareerPageEditor } from "./CareerPageEditor";

export default async function CareersAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const careerPage = await prisma.careerPage.findUnique({ where: { id: 1 } });

  return (
    <div>
      <AdminPageHeader
        title="Careers"
        description="Hero, culture, benefits, and apply instructions"
      />
      <CareerPageEditor initialData={careerPage} />
    </div>
  );
}
