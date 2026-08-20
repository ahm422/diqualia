"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  role: { id: string; name: string; isSystem: boolean };
};

export function UsersList({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const router = useRouter();
  const canDelete = useCan("users.delete");
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(user: AdminUserRow) {
    if (!confirm(`Delete “${user.email}”? This cannot be undone.`)) return;
    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = (await res.json()) as { error?: string };
      if (res.ok) {
        setUsers((prev) => prev.filter((row) => row.id !== user.id));
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

  if (users.length === 0) {
    return (
      <div className="rounded border border-[var(--diq_border)] px-6 py-12 text-center">
        <p className="text-sm text-[var(--diq_mid)]">No users yet.</p>
        <Link
          href="/admin/settings/users/new"
          className="mt-4 inline-block text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
        >
          Create the first user
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-[var(--diq_border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--diq_border)] text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">
            <th className="px-4 py-3 font-normal">Email</th>
            <th className="px-4 py-3 font-normal">Name</th>
            <th className="px-4 py-3 font-normal">Role</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[var(--diq_border)] last:border-0 hover:bg-[var(--diq_panel)]"
            >
              <td className="px-4 py-3 text-foreground">
                <Link
                  href={`/admin/settings/users/${user.id}`}
                  className="hover:text-[var(--gold)]"
                >
                  {user.email}
                </Link>
              </td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">{user.name ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--diq_mid)]">
                {user.role.name}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/settings/users/${user.id}`}
                    className="text-xs text-[var(--diq_mid)] hover:text-[var(--gold)]"
                  >
                    Edit
                  </Link>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {deletingId === user.id ? "…" : "Delete"}
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
