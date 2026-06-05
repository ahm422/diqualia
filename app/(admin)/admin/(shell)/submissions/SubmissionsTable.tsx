"use client";

import { useState } from "react";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  source: string | null;
  read: boolean;
  createdAt: Date | string;
};

type Props = {
  initialLeads: Lead[];
};

export function SubmissionsTable({ initialLeads }: Props) {
  const [leads, setLeads]         = useState<Lead[]>(initialLeads);
  const [sort, setSort]           = useState<"asc" | "desc">("desc");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());

  async function refetch(nextSort: "asc" | "desc", nextUnreadOnly: boolean) {
    setLoading(true);
    const params = new URLSearchParams({ sort: nextSort });
    if (nextUnreadOnly) params.set("unreadOnly", "true");
    const res = await fetch(`/api/admin/submissions?${params}`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json() as Lead[];
      setLeads(data);
    }
    setLoading(false);
  }

  function toggleSort() {
    const next = sort === "desc" ? "asc" : "desc";
    setSort(next);
    refetch(next, unreadOnly);
  }

  function toggleUnreadOnly(checked: boolean) {
    setUnreadOnly(checked);
    refetch(sort, checked);
  }

  async function toggleRead(lead: Lead) {
    const next = !lead.read;
    // Optimistic update
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, read: next } : l));
    const res = await fetch(`/api/admin/submissions/${lead.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: next }),
    });
    if (!res.ok) {
      // Revert on failure
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, read: lead.read } : l));
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function formatDate(iso: Date | string) {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const unreadCount = leads.filter((l) => !l.read).length;

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <button
          onClick={toggleSort}
          disabled={loading}
          className="rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-50"
        >
          Date {sort === "desc" ? "↓ newest" : "↑ oldest"}
        </button>

        <label className="flex items-center gap-2 text-xs text-[var(--diq_mid)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => toggleUnreadOnly(e.target.checked)}
            className="accent-[var(--gold)]"
          />
          Unread only
        </label>

        <span className="text-xs text-[var(--diq_mid)]">
          {unreadCount} unread · {leads.length} total
        </span>

        {loading && <span className="text-xs text-[var(--diq_mid)]">Loading…</span>}
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-[var(--diq_mid)]">No submissions found.</p>
      ) : (
        <div className="rounded-xl border border-[var(--diq_border)] overflow-hidden">
          {/* Header */}
          <div
            className="grid gap-px text-[10px] uppercase tracking-widest text-[var(--diq_mid)] px-4 py-2"
            style={{ gridTemplateColumns: "minmax(120px,1fr) minmax(160px,1.5fr) minmax(200px,3fr) 90px 100px 80px", background: "var(--diq_surface)" }}
          >
            <div>Name</div>
            <div>Email</div>
            <div>Message</div>
            <div>Source</div>
            <div>Date</div>
            <div>Status</div>
          </div>

          {/* Rows */}
          {leads.map((lead) => {
            const isExpanded = expanded.has(lead.id);
            const msg = lead.message ?? "";
            const truncated = msg.length > 120 ? msg.slice(0, 120) + "…" : msg;

            return (
              <div
                key={lead.id}
                className="grid gap-px border-t px-4 py-3 text-sm transition-colors"
                style={{
                  gridTemplateColumns: "minmax(120px,1fr) minmax(160px,1.5fr) minmax(200px,3fr) 90px 100px 80px",
                  borderColor: "var(--diq_border)",
                  background: lead.read ? "var(--diq_surface)" : "color-mix(in oklab, var(--gold) 4%, var(--diq_surface))",
                }}
              >
                <div
                  className="truncate"
                  style={{ fontWeight: lead.read ? 400 : 600, color: lead.read ? "var(--diq_mid)" : "var(--foreground)" }}
                >
                  {lead.name ?? <span className="opacity-40">—</span>}
                </div>

                <div className="truncate text-[var(--diq_mid)]">
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`} className="hover:text-foreground no-underline">
                      {lead.email}
                    </a>
                  ) : (
                    <span className="opacity-40">—</span>
                  )}
                </div>

                <div>
                  {msg ? (
                    <span className="text-[var(--diq_mid)]">
                      {isExpanded ? msg : truncated}
                      {msg.length > 120 && (
                        <button
                          onClick={() => toggleExpand(lead.id)}
                          className="ml-1 text-xs text-[var(--gold)] hover:underline"
                        >
                          {isExpanded ? "less" : "more"}
                        </button>
                      )}
                    </span>
                  ) : (
                    <span className="opacity-40">—</span>
                  )}
                </div>

                <div className="text-xs text-[var(--diq_mid)] truncate">
                  {lead.source ?? <span className="opacity-40">—</span>}
                </div>

                <div className="text-xs text-[var(--diq_mid)]">
                  {formatDate(lead.createdAt)}
                </div>

                <div>
                  <button
                    onClick={() => toggleRead(lead)}
                    className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-widest border transition-colors ${
                      lead.read
                        ? "border-[var(--diq_border)] text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                        : "border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)]"
                    }`}
                  >
                    {lead.read ? "Unread" : "Read"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
