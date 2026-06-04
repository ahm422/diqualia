import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

import { ProcessPageEditor } from "./ProcessPageEditor";

export default async function ProcessPage() {
  await requireAdmin();

  const [initialPage, initialSteps] = await Promise.all([
    prisma.processPage.findUnique({ where: { id: 1 } }),
    prisma.processStep.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-sans text-2xl font-medium mb-8">Process Page</h1>
      <ProcessPageEditor initialPage={initialPage} initialSteps={initialSteps} />
    </div>
  );
}
