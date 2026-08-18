"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { JobOpeningData } from "./JobOpeningEditor";

export function JobOpeningsList({ initialOpenings }: { initialOpenings: JobOpeningData[] }) {
  const router = useRouter();
  const [openings, setOpenings] = useState(initialOpenings);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(opening: JobOpeningData) {
    if (!confirm(`Delete “${opening.title}”? This cannot be undone.`)) return;
    setDeletingId(opening.id);
    try {
      const res = await fetch(`/api/admin/job-openings/${opening.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setOpenings((prev) => prev.filter((row) => row.id !== opening.id));
        toast.success("Deleted");
        router.refresh();
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Delete failed — try again");
    } finally {
      setDeletingId(null);
    }
  }

  if (openings.length === 0) {
    return (
      <div className="rounded border border-[var(--diq_border)] px-6 py-12 text-center">
        <p className="text-sm text-[var(--diq_mid)]">No openings yet.</p>
        <Link
          href="/admin/careers/openings/new"
          className="mt-4 inline-block text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
        >
          Create the first opening
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-[var(--diq_border)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--diq_border)] text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">
            <th className="px-4 py-3 font-normal">Title</th>
            <th className="px-4 py-3 font-normal">Slug</th>
            <th className="px-4 py-3 font-normal">Department</th>
            <th className="px-4 py-3 font-normal">Visible</th>
            <th className="px-4 py-3 font-normal">Order</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody>
          {openings.map((opening) => (
            <tr
              key={opening.id}
              className="border-b border-[var(--diq_border)] last:border-0 hover:bg-[var(--diq_panel)]"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/admin/careers/openings/${opening.id}`}
                  className="text-foreground hover:text-[var(--gold)]"
                >
                  {opening.title}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[var(--diq_mid)]">{opening.slug}</td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">{opening.department}</td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">{opening.visible ? "Yes" : "No"}</td>
              <td className="px-4 py-3 text-[var(--diq_mid)]">{opening.order}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleDelete(opening)}
                  disabled={deletingId === opening.id}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {deletingId === opening.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
