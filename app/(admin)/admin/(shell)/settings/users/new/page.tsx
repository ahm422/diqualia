import { AdminPageHeader } from "@/components/admin";
import { requirePermission } from "@/lib/auth/require-admin";

import { loadAssignableRoles } from "../loadAssignableRoles";
import { UserEditor } from "../UserEditor";

export default async function NewAdminUserPage() {
  await requirePermission("users.manage");
  const roles = await loadAssignableRoles();

  return (
    <div>
      <AdminPageHeader title="New user" description="Create a CMS operator and assign a role." />
      <UserEditor roles={roles} />
    </div>
  );
}
