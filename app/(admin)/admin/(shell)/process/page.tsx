import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin";

import { ProcessPageEditor } from "./ProcessPageEditor";

export default async function ProcessPage() {
  await requireAdmin();

  const [initialPage, initialSteps] = await Promise.all([
    prisma.processPage.findUnique({ where: { id: 1 } }),
    prisma.processStep.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="How We Work" description="Page hero, process steps, and Where Next section" />
      <ProcessPageEditor initialPage={initialPage} initialSteps={initialSteps} />
    </div>
  );
}
