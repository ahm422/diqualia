import { AdminPageHeader } from "@/components/admin";

import { loadAssignableRoles } from "../loadAssignableRoles";
import { UserEditor } from "../UserEditor";

export default async function NewAdminUserPage() {
  const roles = await loadAssignableRoles();

  return (
    <div>
      <AdminPageHeader title="New user" description="Create a CMS operator and assign a role." />
      <UserEditor roles={roles} />
    </div>
  );
}
