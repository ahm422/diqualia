import { requireAdmin } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { StepsEditor } from "./StepsEditor";

export default async function ProcessStepsAdminPage() {
  const prisma = await getDb();
  await requireAdmin();

  const initialSteps = await prisma.processStep.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Steps"
        description="The numbered process steps on How We Work."
        previewHref="/process#steps"
      />
      <StepsEditor initial={initialSteps} />
    </div>
  );
}
