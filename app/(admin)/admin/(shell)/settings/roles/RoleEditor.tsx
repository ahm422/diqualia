"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminSaveButton,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { PERMISSION_KEYS, type PermissionKey } from "@/lib/auth/session";

const PERMISSION_LABELS: Record<PermissionKey, string> = {
  "content.create": "Create CMS rows",
  "content.edit": "Edit CMS rows, uploads, mark submissions",
  "content.delete": "Delete CMS rows",
  "content.publish": "Publish blog posts",
  "users.manage": "List / create / edit users",
  "users.delete": "Delete users",
  "roles.manage": "Manage roles",
};

export type RoleEditorInitial = {
  id: string;
  name: string;
  isSystem: boolean;
  permissionKeys: PermissionKey[];
};

export function RoleEditor({ initial }: { initial?: RoleEditorInitial | null }) {
  const router = useRouter();
  const isNew = !initial;
  const readOnly = Boolean(initial?.isSystem);

  const [name, setName] = useState(initial?.name ?? "");
  const [keys, setKeys] = useState<PermissionKey[]>(initial?.permissionKeys ?? []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toggle(key: PermissionKey) {
    if (readOnly) return;
    setKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSave() {
    if (readOnly) return;
    setSaving(true);
    try {
      const res = await fetch(isNew ? "/api/admin/roles" : `/api/admin/roles/${initial.id}`, {
        method: isNew ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissionKeys: keys }),
      });
      const result = (await res.json()) as { id?: string; error?: string };
      if (res.ok && result.id) {
        toast.success(isNew ? "Created" : "Saved");
        if (isNew) router.push(`/admin/settings/roles/${result.id}`);
        router.refresh();
      } else {
        toast.error(typeof result.error === "string" ? result.error : "Save failed");
      }
    } catch {
      toast.error("Save failed — try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial || readOnly) return;
    if (!confirm(`Delete role “${initial.name}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${initial.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await res.json()) as { error?: string };
      if (res.ok) {
        toast.success("Deleted");
        router.push("/admin/settings/roles");
        router.refresh();
      } else {
        toast.error(typeof result.error === "string" ? result.error : "Delete failed");
      }
    } catch {
      toast.error("Delete failed — try again");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/settings/roles"
          className="text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)]"
        >
          ← All roles
        </Link>
      </div>

      <AdminSection title={isNew ? "New role" : readOnly ? "System role" : "Edit role"}>
        <AdminField label="Name">
          <AdminInput
            value={name}
            onChange={setName}
            placeholder="content_manager"
            disabled={readOnly}
          />
        </AdminField>
        {readOnly ? (
          <p className="mb-4 text-xs text-[var(--diq_mid)]">
            System roles cannot be renamed, edited, or deleted. Create a custom role to change the matrix.
          </p>
        ) : null}
        <fieldset className="mb-4" disabled={readOnly}>
          <legend className="mb-2 text-xs uppercase tracking-widest text-[var(--diq_mid)]">
            Permissions
          </legend>
          <div className="flex flex-col gap-2">
            {PERMISSION_KEYS.map((key) => (
              <label key={key} className="flex items-start gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={keys.includes(key)}
                  onChange={() => toggle(key)}
                  disabled={readOnly}
                  className="mt-0.5 accent-[var(--gold)]"
                />
                <span>
                  <span className="font-mono text-xs">{key}</span>
                  <span className="block text-xs text-[var(--diq_mid)]">{PERMISSION_LABELS[key]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {!readOnly && (
            <AdminSaveButton onClick={handleSave} saving={saving} requirePermission={false} />
          )}
          {!isNew && !readOnly && (
            <Button
              type="button"
              variant="destructive"
              size="admin"
              className="mt-4"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
