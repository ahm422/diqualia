"use client";

import { Fragment, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { highlightRowRef } from "@/lib/highlight-row";
import type { JobApplicationAdminView } from "@/lib/schemas/admin/career";

const STATUSES = ["new", "reviewing", "rejected", "hired"] as const;

type Application = JobApplicationAdminView;

type Props = {
  initialApplications: Application[];
  initialStatus?: string;
  canRevealPii: boolean;
};

function statusVariant(status: string): "new" | "gold" | "default" | "read" {
  if (status === "new") return "new";
  if (status === "hired") return "gold";
  if (status === "rejected") return "read";
  return "default";
}

function dash(value: string | number | boolean | null | undefined) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function ApplicationsTable({
  initialApplications,
  initialStatus = "",
  canRevealPii,
}: Props) {
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");
  const [rows, setRows] = useState(initialApplications);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleReveal(id: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function downloadFile(id: string, kind: "resume" | "photo") {
    setDownloading(`${kind}-${id}`);
    try {
      const res = await fetch(`/api/admin/job-applications/${id}/${kind}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `${kind}-${id}`;
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
          className="min-h-11 rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-50"
        >
          Date {sort === "desc" ? "↓ newest" : "↑ oldest"}
        </button>
        <select
          value={status}
          onChange={(e) => changeStatusFilter(e.target.value)}
          className="min-h-11 rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {canRevealPii ? (
          <a
            href="/api/admin/job-applications/export.csv"
            className="min-h-11 px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
          >
            Export CSV
          </a>
        ) : null}
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
                <th className="px-4 py-3 font-normal">CNIC</th>
                <th className="px-4 py-3 font-normal" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isHighlighted = highlight === row.id;
                const isExpanded = expanded.has(row.id) || isHighlighted;
                const showRaw = canRevealPii && revealed.has(row.id) && row.cnic;
                return (
                <Fragment key={row.id}>
                  <tr
                    id={`application-${row.id}`}
                    ref={isHighlighted ? highlightRowRef : undefined}
                    tabIndex={-1}
                    className="border-b border-[var(--diq_border)] outline-none hover:bg-[var(--diq_panel)]"
                    style={{
                      boxShadow: isHighlighted ? "inset 3px 0 0 var(--gold)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpand(row.id)}
                        className="min-h-11 text-left text-foreground hover:text-[var(--gold)]"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-[var(--diq_mid)]">{row.email}</td>
                    <td className="px-4 py-3 text-[var(--diq_mid)]">{row.jobTitle}</td>
                    <td className="px-4 py-3 text-[var(--diq_mid)]">{formatDate(row.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                        <select
                          value={row.status}
                          onChange={(e) => updateStatus(row, e.target.value)}
                          className="min-h-11 rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--diq_mid)]">{row.cnicMasked}</td>
                    <td className="px-4 py-3 text-right">
                      {canRevealPii ? (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => downloadFile(row.id, "resume")}
                            disabled={downloading === `resume-${row.id}`}
                            className="min-h-11 text-xs uppercase tracking-widest text-[var(--gold)] hover:underline disabled:opacity-50"
                          >
                            {downloading === `resume-${row.id}` ? "…" : "Download resume"}
                          </button>
                          {row.photoKey ? (
                            <button
                              type="button"
                              onClick={() => downloadFile(row.id, "photo")}
                              disabled={downloading === `photo-${row.id}`}
                              className="min-h-11 text-xs uppercase tracking-widest text-[var(--gold)] hover:underline disabled:opacity-50"
                            >
                              {downloading === `photo-${row.id}` ? "…" : "Download photo"}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr className="border-b border-[var(--diq_border)] bg-[var(--diq_panel)]">
                      <td colSpan={7} className="px-4 py-4 text-sm text-[var(--diq_mid)]">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <section>
                            <div className="text-[11px] uppercase tracking-widest text-[var(--gold)]">Personal</div>
                            <dl className="mt-3 space-y-2">
                              <div>Father / husband: {dash(row.fatherOrHusbandName)}</div>
                              <div>DOB: {dash(row.dateOfBirth)}</div>
                              <div>Gender: {dash(row.gender)}</div>
                              <div>Marital status: {dash(row.maritalStatus)}</div>
                              <div>Nationality: {dash(row.nationality)}</div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span>CNIC: {showRaw ? row.cnic : row.cnicMasked}</span>
                                {canRevealPii && row.cnic ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleReveal(row.id)}
                                    className="min-h-11 text-xs uppercase tracking-widest text-[var(--gold)] hover:underline"
                                  >
                                    {revealed.has(row.id) ? "Hide CNIC" : "Reveal CNIC"}
                                  </button>
                                ) : null}
                              </div>
                            </dl>
                          </section>
                          <section>
                            <div className="text-[11px] uppercase tracking-widest text-[var(--gold)]">Contact</div>
                            <dl className="mt-3 space-y-2">
                              <div>Phone: {dash(row.phone)}</div>
                              <div>City: {dash(row.city)}</div>
                              <div className="whitespace-pre-wrap">Address: {dash(row.currentAddress)}</div>
                            </dl>
                          </section>
                          <section>
                            <div className="text-[11px] uppercase tracking-widest text-[var(--gold)]">Education</div>
                            <dl className="mt-3 space-y-2">
                              <div>Qualification: {dash(row.highestQualification)}</div>
                              <div>Field: {dash(row.fieldOfStudy)}</div>
                              <div>Institution: {dash(row.institutionName)}</div>
                              <div>Year: {dash(row.yearOfCompletion)}</div>
                            </dl>
                          </section>
                          <section>
                            <div className="text-[11px] uppercase tracking-widest text-[var(--gold)]">Experience</div>
                            <dl className="mt-3 space-y-2">
                              <div>Years: {dash(row.yearsOfExperience)}</div>
                              <div>Employer: {dash(row.currentEmployer)}</div>
                              <div>Title: {dash(row.currentJobTitle)}</div>
                            </dl>
                          </section>
                          <section>
                            <div className="text-[11px] uppercase tracking-widest text-[var(--gold)]">Skills</div>
                            <dl className="mt-3 space-y-2">
                              <div className="whitespace-pre-wrap">Key skills: {dash(row.keySkills)}</div>
                              <div>Notice (days): {dash(row.noticePeriodDays)}</div>
                              <div>Expected salary (PKR): {dash(row.expectedSalary)}</div>
                              <div>Available from: {dash(row.availableFrom)}</div>
                              <div className="whitespace-pre-wrap">Cover note: {dash(row.coverNote)}</div>
                            </dl>
                          </section>
                          <section>
                            <div className="text-[11px] uppercase tracking-widest text-[var(--gold)]">Documents</div>
                            <dl className="mt-3 space-y-2">
                              <div>Resume: {row.resumeKey ? "on file" : "—"}</div>
                              <div>Photo: {row.photoKey ? "on file" : "—"}</div>
                              <div>Declaration: {dash(row.declarationAccepted)}</div>
                            </dl>
                          </section>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
