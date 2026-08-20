import { requirePermission } from "@/lib/auth/require-admin";
import { AdminPageHeader } from "@/components/admin";

import { JobOpeningEditor } from "../JobOpeningEditor";

export default async function NewJobOpeningPage() {
  await requirePermission("content.create");

  return (
    <div>
      <AdminPageHeader
        title="New opening"
        description="Create a role. Hidden openings 404 on the public site."
      />
      <JobOpeningEditor />
    </div>
  );
}
