import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { JobOpeningEditor } from "../JobOpeningEditor";

export default async function EditJobOpeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = await getDb();
  await requirePermission("careers.openings.manage");

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) notFound();

  const opening = await prisma.jobOpening.findUnique({ where: { id: numId } });
  if (!opening) notFound();

  return (
    <div>
      <AdminPageHeader title="Edit opening" description={opening.slug} />
      <JobOpeningEditor initial={opening} />
    </div>
  );
}
