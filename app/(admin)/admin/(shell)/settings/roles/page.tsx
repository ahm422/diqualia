import Link from "next/link";

import { requirePermission } from "@/lib/auth/require-admin";
import { getDb } from "@/lib/cloudflare-env";
import { isPermissionKey } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";

import { RolesList, type RoleRow } from "./RolesList";

export default async function AdminRolesPage() {
  const prisma = await getDb();
  await requirePermission("roles.manage");

  const roles = await prisma.role.findMany({
    include: { permissions: { include: { permission: true } } },
    orderBy: { name: "asc" },
  });

  const rows: RoleRow[] = roles.map((role) => ({
    id: role.id,
    name: role.name,
    isSystem: role.isSystem,
    permissionKeys: role.permissions.map((row) => row.permission.key).filter(isPermissionKey),
  }));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-medium text-foreground">Roles</h1>
          <p className="mt-1 text-sm text-[var(--diq_mid)]">
            System roles are read-only. Custom roles change the permission matrix.
          </p>
        </div>
        <Button asChild variant="secondary" size="admin" className="shrink-0">
          <Link href="/admin/settings/roles/new">New role</Link>
        </Button>
      </div>
      <RolesList initialRoles={rows} />
    </div>
  );
}
