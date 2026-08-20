"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { PermissionKey } from "@/lib/auth/session";

export type RoleRow = {
  id: string;
  name: string;
  isSystem: boolean;
  permissionKeys: PermissionKey[];
};

export function RolesList({ initialRoles }: { initialRoles: RoleRow[] }) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(role: RoleRow) {
    if (role.isSystem) return;
    if (!confirm(`Delete role “${role.name}”? This cannot be undone.`)) return;
    setDeletingId(role.id);
    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await res.json()) as { error?: string };
      if (res.ok) {
        setRoles((prev) => prev.filter((row) => row.id !== role.id));
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error(typeof result.error === "string" ? result.error : "Delete failed");
      }
    } catch {
      toast.error("Delete failed — try again");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded border border-[var(--diq_border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--diq_border)] text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">
            <th className="px-4 py-3 font-normal">Name</th>
            <th className="px-4 py-3 font-normal">Type</th>
            <th className="px-4 py-3 font-normal">Permissions</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr
              key={role.id}
              className="border-b border-[var(--diq_border)] last:border-0 hover:bg-[var(--diq_panel)]"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/settings/roles/${role.id}`}
                  className="text-foreground hover:text-[var(--gold)]"
                >
                  {role.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">
                {role.isSystem ? "System" : "Custom"}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--diq_mid)]">
                {role.permissionKeys.join(", ")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/settings/roles/${role.id}`}
                    className="text-xs text-[var(--diq_mid)] hover:text-[var(--gold)]"
                  >
                    {role.isSystem ? "View" : "Edit"}
                  </Link>
                  {!role.isSystem && (
                    <button
                      type="button"
                      onClick={() => handleDelete(role)}
                      disabled={deletingId === role.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === role.id ? "…" : "Delete"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
