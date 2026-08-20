"use client";

import { Button } from "@/components/ui/button";

import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

export function AdminSaveButton({
  onClick,
  saving,
  requirePermission = true,
}: {
  onClick: () => void;
  saving: boolean;
  requirePermission?: boolean;
}) {
  const canEdit = useCan("content.edit");
  if (requirePermission && !canEdit) return null;

  return (
    <div className="mt-4">
      <Button type="button" variant="secondary" onClick={onClick} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
