import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminPageHeader } from "@/components/admin";

export default async function AdminForbiddenPage() {
  await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Forbidden"
        description="Your role does not include this page. Ask a super admin if you need access."
      />
    </div>
  );
}
