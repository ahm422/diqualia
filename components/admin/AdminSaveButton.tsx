import { Button } from "@/components/ui/button";

export function AdminSaveButton({
  onClick,
  saving,
}: {
  onClick: () => void;
  saving: boolean;
}) {
  return (
    <div className="mt-4">
      <Button type="button" variant="secondary" onClick={onClick} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  );
}
