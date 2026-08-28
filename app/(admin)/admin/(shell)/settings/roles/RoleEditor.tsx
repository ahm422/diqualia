"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminSaveButton,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { permissionCatalogByGroup } from "@/lib/auth/permission-catalog";
import { type PermissionKey } from "@/lib/auth/session";

export type RoleEditorInitial = {
  /** Present when editing an existing role; absent when seeding a new/duplicated role. */
  id?: string;
  name: string;
  isSystem?: boolean;
  permissionKeys: PermissionKey[];
};

function duplicateHref(name: string, keys: PermissionKey[]): string {
  const params = new URLSearchParams({ from: `${name}_copy`, keys: keys.join(",") });
  return `/admin/settings/roles/new?${params.toString()}`;
}

export function RoleEditor({ initial }: { initial?: RoleEditorInitial | null }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const readOnly = Boolean(initial?.isSystem);
  const groups = useMemo(() => permissionCatalogByGroup(), []);

  const [name, setName] = useState(initial?.name ?? "");
  const [keys, setKeys] = useState<PermissionKey[]>(initial?.permissionKeys ?? []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keySet = useMemo(() => new Set(keys), [keys]);

  function toggle(key: PermissionKey) {
    if (readOnly) return;
    setKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function setGroup(groupKeys: PermissionKey[], checked: boolean) {
    if (readOnly) return;
    setKeys((prev) => {
      const next = new Set(prev);
      for (const k of groupKeys) {
        if (checked) next.add(k);
        else next.delete(k);
      }
      return Array.from(next);
    });
  }

  async function handleSave() {
    if (readOnly) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(isNew ? "/api/admin/roles" : `/api/admin/roles/${initial!.id}`, {
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
        const message = typeof result.error === "string" ? result.error : "Save failed";
        setError(message);
        toast.error(message);
      }
    } catch {
      setError("Save failed — try again");
      toast.error("Save failed — try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial?.id || readOnly) return;
    if (!confirm(`Delete role “${initial.name}”? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
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
        const message = typeof result.error === "string" ? result.error : "Delete failed";
        setError(message);
        toast.error(message);
      }
    } catch {
      setError("Delete failed — try again");
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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-xs text-[var(--diq_mid)]">
              This is a system role — its permissions are fixed. Clone it to customise.
            </p>
            <Button asChild variant="secondary" size="admin">
              <Link href={duplicateHref(initial!.name, initial!.permissionKeys)}>Duplicate</Link>
            </Button>
          </div>
        ) : null}

        <fieldset className="mb-4 flex flex-col gap-6" disabled={readOnly}>
          <legend className="mb-2 text-xs uppercase tracking-widest text-[var(--diq_mid)]">
            Permissions
          </legend>

          {groups.map(({ group, entries }) => {
            const groupKeys = entries.map((e) => e.key);
            const selectedInGroup = groupKeys.filter((k) => keySet.has(k)).length;
            const allSelected = selectedInGroup === groupKeys.length;
            const someSelected = selectedInGroup > 0 && !allSelected;
            const groupId = `role-group-${group.replace(/[^a-z]+/gi, "-").toLowerCase()}`;
            return (
              <div key={group}>
                <div className="mb-2 flex items-center gap-2 border-b border-[var(--diq_border)] pb-1">
                  <input
                    type="checkbox"
                    id={groupId}
                    className="accent-[var(--gold)]"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => setGroup(groupKeys, e.target.checked)}
                    disabled={readOnly}
                  />
                  <label htmlFor={groupId} className="text-sm font-medium text-foreground">
                    {group}
                    <span className="ml-2 text-xs font-normal text-[var(--diq_mid)]">
                      {selectedInGroup}/{groupKeys.length}
                    </span>
                  </label>
                </div>
                <div className="flex flex-col gap-2 pl-6">
                  {entries.map((entry) => (
                    <div key={entry.key} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        id={`role-perm-${entry.key}`}
                        className="mt-0.5 accent-[var(--gold)]"
                        checked={keySet.has(entry.key)}
                        onChange={() => toggle(entry.key)}
                        disabled={readOnly}
                      />
                      <label htmlFor={`role-perm-${entry.key}`} className="text-foreground">
                        <span className="font-medium">{entry.label}</span>
                        <span className="ml-2 font-mono text-xs text-[var(--diq_mid)]">
                          {entry.key}
                        </span>
                        <span className="block text-xs text-[var(--diq_mid)]">
                          {entry.description}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>

        {error ? (
          <p className="mb-3 text-sm text-[var(--diq_danger,#e5484d)]" role="alert">
            {error}
          </p>
        ) : null}

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
