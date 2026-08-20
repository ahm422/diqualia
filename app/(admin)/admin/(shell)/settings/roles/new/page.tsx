import { AdminPageHeader } from "@/components/admin";
import { requirePermission } from "@/lib/auth/require-admin";

import { RoleEditor } from "../RoleEditor";

export default async function NewRolePage() {
  await requirePermission("roles.manage");

  return (
    <div>
      <AdminPageHeader title="New role" description="Custom role with a subset of permissions." />
      <RoleEditor />
    </div>
  );
}
