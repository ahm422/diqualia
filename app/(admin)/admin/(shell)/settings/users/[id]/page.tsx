import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { AdminPageHeader } from "@/components/admin";

import { loadAssignableRoles } from "../loadAssignableRoles";
import { UserEditor } from "../UserEditor";

export default async function EditAdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = await getDb();
  await requirePermission("users.manage");

  const { id } = await params;
  const user = await prisma.adminUser.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, roleId: true },
  });
  if (!user) notFound();

  const roles = await loadAssignableRoles(user.roleId);

  return (
    <div>
      <AdminPageHeader title="Edit user" description={user.email} />
      <UserEditor initial={user} roles={roles} />
    </div>
  );
}
