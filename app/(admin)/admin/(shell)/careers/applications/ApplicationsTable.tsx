"use client";

import { Fragment, useState } from "react";

const STATUSES = ["new", "reviewing", "rejected", "hired"] as const;

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  coverNote: string | null;
  status: string;
  submittedAt: Date | string;
};

type Props = {
  initialApplications: Application[];
};

export function ApplicationsTable({ initialApplications }: Props) {
  const [rows, setRows] = useState(initialApplications);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);

  async function refetch(nextSort: "asc" | "desc", nextStatus: string) {
    setLoading(true);
    const params = new URLSearchParams({ sort: nextSort });
    if (nextStatus) params.set("status", nextStatus);
    const res = await fetch(`/api/admin/job-applications?${params}`, { credentials: "include" });
    if (res.ok) {
      const data = (await res.json()) as Application[];
      setRows(data);
    }
    setLoading(false);
  }

  function toggleSort() {
    const next = sort === "desc" ? "asc" : "desc";
    setSort(next);
    refetch(next, status);
  }

  function changeStatusFilter(next: string) {
    setStatus(next);
    refetch(sort, next);
  }

  async function updateStatus(row: Application, nextStatus: string) {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: nextStatus } : r)));
    const res = await fetch(`/api/admin/job-applications/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!res.ok) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: row.status } : r)));
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function downloadResume(id: string) {
    setDownloading(id);
    try {
      const res = await fetch(`/api/admin/job-applications/${id}/resume`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `resume-${id}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  function formatDate(iso: Date | string) {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <button
          onClick={toggleSort}
          disabled={loading}
          className="rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-50"
        >
          Date {sort === "desc" ? "↓ newest" : "↑ oldest"}
        </button>
        <select
          value={status}
          onChange={(e) => changeStatusFilter(e.target.value)}
          className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <div className="rounded border border-[var(--diq_border)] px-6 py-12 text-center text-sm text-[var(--diq_mid)]">
          No applications.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--diq_border)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--diq_border)] text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">Role</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
              <Fragment key={row.id}>
                  <tr key={row.id} className="border-b border-[var(--diq_border)] hover:bg-[var(--diq_panel)]">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(row.id)}
                        className="text-left text-foreground hover:text-[var(--gold)]"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[var(--diq_mid)]">{row.email}</td>
                    <td className="px-4 py-3 text-[var(--diq_mid)]">{row.jobTitle}</td>
                    <td className="px-4 py-3 text-[var(--diq_mid)]">{formatDate(row.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={row.status}
                        onChange={(e) => updateStatus(row, e.target.value)}
                        className="rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => downloadResume(row.id)}
                        disabled={downloading === row.id}
                        className="text-xs uppercase tracking-widest text-[var(--gold)] hover:underline disabled:opacity-50"
                      >
                        {downloading === row.id ? "…" : "Download resume"}
                      </button>
                    </td>
                  </tr>
                  {expanded.has(row.id) ? (
                    <tr className="border-b border-[var(--diq_border)] bg-[var(--diq_panel)]">
                      <td colSpan={6} className="px-4 py-4 text-sm text-[var(--diq_mid)]">
                        <div>Phone: {row.phone || "—"}</div>
                        <div className="mt-2 whitespace-pre-wrap">
                          Cover note: {row.coverNote || "—"}
                        </div>
                      </td>
                    </tr>
                  ) : null}
              </Fragment>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
