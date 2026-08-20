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
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

export type RoleOption = { id: string; name: string; isSystem: boolean };

export type UserEditorInitial = {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
};

export function UserEditor({
  initial,
  roles,
}: {
  initial?: UserEditorInitial | null;
  roles: RoleOption[];
}) {
  const router = useRouter();
  const isNew = !initial;
  const canDelete = useCan("users.delete");

  const [email, setEmail] = useState(initial?.email ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [roleId, setRoleId] = useState(initial?.roleId ?? roles[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        email,
        name: name.trim() ? name.trim() : null,
        roleId,
      };
      if (isNew || password) payload.password = password;

      const res = await fetch(isNew ? "/api/admin/users" : `/api/admin/users/${initial.id}`, {
        method: isNew ? "POST" : "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as { id?: string; error?: string };
      if (res.ok && result.id) {
        toast.success(isNew ? "Created" : "Saved");
        if (isNew) router.push(`/admin/settings/users/${result.id}`);
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
    if (!initial) return;
    if (!confirm(`Delete “${initial.email}”? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${initial.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await res.json()) as { error?: string };
      if (res.ok) {
        toast.success("Deleted");
        router.push("/admin/settings/users");
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
          href="/admin/settings/users"
          className="text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:text-[var(--gold)]"
        >
          ← All users
        </Link>
      </div>

      <AdminSection title={isNew ? "New user" : "Edit user"}>
        <AdminField label="Email">
          <AdminInput value={email} onChange={setEmail} type="email" placeholder="operator@example.com" />
        </AdminField>
        <AdminField label="Name">
          <AdminInput value={name} onChange={setName} placeholder="Optional" />
        </AdminField>
        <AdminField label="Role">
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label={isNew ? "Password" : "Password (leave blank to keep)"}>
          <AdminInput
            value={password}
            onChange={setPassword}
            type="password"
            placeholder={isNew ? "At least 8 characters" : "••••••••"}
          />
        </AdminField>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <AdminSaveButton onClick={handleSave} saving={saving} requirePermission={false} />
          {!isNew && canDelete && (
            <Button
              type="button"
              variant="destructive"
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
