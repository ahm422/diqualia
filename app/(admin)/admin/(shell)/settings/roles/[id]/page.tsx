import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { isPermissionKey } from "@/lib/auth/session";
import { AdminPageHeader } from "@/components/admin";

import { RoleEditor } from "../RoleEditor";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const prisma = await getDb();
  await requirePermission("roles.manage");

  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } } },
  });
  if (!role) notFound();

  return (
    <div>
      <AdminPageHeader
        title={role.isSystem ? "System role" : "Edit role"}
        description={role.name}
      />
      <RoleEditor
        initial={{
          id: role.id,
          name: role.name,
          isSystem: role.isSystem,
          permissionKeys: role.permissions.map((row) => row.permission.key).filter(isPermissionKey),
        }}
      />
    </div>
  );
}
