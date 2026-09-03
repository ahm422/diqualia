"use client";

import { Button } from "@/components/ui/button";

import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";
import type { PermissionKey } from "@/lib/auth/session";

export function AdminSaveButton({
  onClick,
  saving,
  requirePermission = true,
  permission = "content.edit",
}: {
  onClick: () => void;
  saving: boolean;
  requirePermission?: boolean;
  permission?: PermissionKey;
}) {
  const allowed = useCan(permission);
  if (requirePermission && !allowed) return null;

  return (
    <div className="mt-4">
      <Button type="button" variant="secondary" size="admin" onClick={onClick} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
