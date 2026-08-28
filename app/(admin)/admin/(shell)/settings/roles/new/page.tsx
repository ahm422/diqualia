import { AdminPageHeader } from "@/components/admin";
import { requirePermission } from "@/lib/auth/require-admin";
import { isPermissionKey } from "@/lib/auth/session";

import { RoleEditor, type RoleEditorInitial } from "../RoleEditor";

export default async function NewRolePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; keys?: string }>;
}) {
  await requirePermission("roles.manage");
  const { from, keys } = await searchParams;

  // Seeded from a "Duplicate" action on a system/other role — no id, so the
  // editor still treats this as a brand-new custom role.
  const initial: RoleEditorInitial | undefined = from
    ? {
        name: from,
        isSystem: false,
        permissionKeys: (keys ?? "")
          .split(",")
          .map((k) => k.trim())
          .filter(isPermissionKey),
      }
    : undefined;

  return (
    <div>
      <AdminPageHeader title="New role" description="Custom role with a subset of permissions." />
      <RoleEditor initial={initial} />
    </div>
  );
}
