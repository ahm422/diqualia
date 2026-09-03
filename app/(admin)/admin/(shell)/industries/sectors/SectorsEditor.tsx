"use client";

import { Suspense, useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
  useScrollToSection,
} from "@/components/admin";
import { slugify } from "@/lib/slugify";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

import {
  normalizeSector,
  type CaseStudyRef,
  type IndustriesPageData,
  type IndustrySector,
  type WhyPoint,
} from "../types";

export function SectorsEditor({
  initialPage,
  initialSectors,
}: {
  initialPage: IndustriesPageData;
  initialSectors: IndustrySector[];
}) {
  return (
    <Suspense fallback={null}>
      <SectorsEditorInner initialPage={initialPage} initialSectors={initialSectors} />
    </Suspense>
  );
}

function SectorsEditorInner({
  initialPage,
  initialSectors,
}: {
  initialPage: IndustriesPageData;
  initialSectors: IndustrySector[];
}) {
  useScrollToSection();
  const [sectorsLabel, setSectorsLabel] = useState(initialPage?.sectorsLabel ?? "");
  const [sectorsDescription, setSectorsDescription] = useState(initialPage?.sectorsDescription ?? "");
  const [sidebarLabel, setSidebarLabel] = useState(initialPage?.sidebarLabel ?? "");
  const [sidebarCopy, setSidebarCopy] = useState(initialPage?.sidebarCopy ?? "");
  const { save: saveCopy, saving: copyStatus } = useAdminSave("/api/admin/industries-page");

  const [sectors, setSectors] = useState<IndustrySector[]>(initialSectors);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");

  async function patchSector(id: number, data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/industry-sectors/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = normalizeSector((await res.json()) as IndustrySector);
      setSectors((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    }
    return null;
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = sectors.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sectors.length) return;
    const a = sectors[idx]; const b = sectors[swapIdx];
    await Promise.all([patchSector(a.id, { order: b.order }), patchSector(b.id, { order: a.order })]);
    const next = [...sectors];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setSectors(next.sort((x, y) => x.order - y.order));
  }

  async function del(id: number) {
    if (!confirm("Delete this sector?")) return;
    const res = await fetch(`/api/admin/industry-sectors/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      setSectors((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
      if (expandedId === id) setExpandedId(null);
    }
  }

  async function add() {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/industry-sectors", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const sector = normalizeSector((await res.json()) as IndustrySector);
      setSectors((prev) => [...prev, sector]);
      setNewName("");
      setExpandedId(sector.id);
    }
    setAdding(false);
  }

  return (
    <div>
      <AdminSection id="copy" title="Sectors copy">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Sectors Label"><AdminInput value={sectorsLabel} onChange={setSectorsLabel} placeholder="Sectors we actively research" /></AdminField>
          <AdminField label="Sidebar Label"><AdminInput value={sidebarLabel} onChange={setSidebarLabel} placeholder="Active research" /></AdminField>
          <AdminField label="Sectors Description"><AdminTextarea value={sectorsDescription} onChange={setSectorsDescription} rows={2} /></AdminField>
          <AdminField label="Sidebar Copy"><AdminTextarea value={sidebarCopy} onChange={setSidebarCopy} rows={2} /></AdminField>
        </div>
        <AdminSaveButton onClick={() => saveCopy({ sectorsLabel, sectorsDescription, sidebarLabel, sidebarCopy })} saving={copyStatus} />
      </AdminSection>

      <AdminSection id="tags" title="Sector tags">
        <div className="space-y-2">
          {sectors.map((sector, idx) => (
            <div key={sector.id} className="rounded border border-[var(--diq_border2)]">
              <div className="flex items-center gap-3 p-3">
                <input
                  defaultValue={sector.name}
                  key={`${sector.id}-${sector.name}`}
                  onBlur={(e) => { if (e.target.value !== sector.name) patchSector(sector.id, { name: e.target.value }); }}
                  className="flex-1 rounded border border-transparent bg-transparent px-1 text-sm focus:border-[var(--diq_border)] focus:outline-none"
                />
                <label className="flex items-center gap-2 text-xs text-foreground shrink-0">
                  <input
                    type="checkbox"
                    checked={sector.visible}
                    onChange={() => patchSector(sector.id, { visible: !sector.visible })}
                    className="accent-[var(--gold)]"
                  />
                  Active research
                </label>
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => move(sector.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
                  <button type="button" onClick={() => move(sector.id, 1)} disabled={idx === sectors.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (prev === sector.id ? null : sector.id))}
                  className="text-xs text-[var(--gold)] hover:underline shrink-0"
                >
                  {expandedId === sector.id ? "Close" : "Edit page"}
                </button>
                {canDelete && (
                  <button type="button" onClick={() => del(sector.id)} className="text-xs text-[var(--destructive)] hover:opacity-80 shrink-0">Delete</button>
                )}
              </div>
              {expandedId === sector.id && (
                <SectorPagePanel
                  sector={sector}
                  onSaved={(updated) => {
                    setSectors((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {canCreate && (
        <div className="mt-4 border-t border-[var(--diq_border2)] pt-4 flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">New sector name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Maritime & Ports"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={adding || !newName.trim()}
            className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50"
          >
            Add
          </button>
        </div>
        )}
      </AdminSection>
    </div>
  );
}

function SectorPagePanel({
  sector,
  onSaved,
}: {
  sector: IndustrySector;
  onSaved: (sector: IndustrySector) => void;
}) {
  const autoSlug = slugify(sector.name) || "sector";
  const [slugManual, setSlugManual] = useState(sector.slug);
  const [slugTouched, setSlugTouched] = useState(
    sector.slug !== "" && sector.slug !== slugify(sector.name),
  );
  const slug = slugTouched ? slugManual : autoSlug;
  const [eyebrow, setEyebrow] = useState(sector.eyebrow ?? "");
  const [headline, setHeadline] = useState(sector.headline ?? "");
  const [body, setBody] = useState(sector.body ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(sector.heroImageUrl ?? "");
  const [whyPoints, setWhyPoints] = useState<WhyPoint[]>(sector.whyPoints ?? []);
  const [caseStudyRefs, setCaseStudyRefs] = useState<CaseStudyRef[]>(sector.caseStudyRefs ?? []);
  const [saving, setSaving] = useState(false);

  async function savePage() {
    setSaving(true);
    const res = await fetch(`/api/admin/industry-sectors/${sector.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug || autoSlug,
        eyebrow: eyebrow || null,
        headline: headline || null,
        body: body || null,
        heroImageUrl: heroImageUrl || null,
        whyPoints: whyPoints.filter((p) => p.title.trim() && p.body.trim()),
        caseStudyRefs: caseStudyRefs.filter((r) => r.label.trim() && r.href.trim()),
      }),
    });
    if (res.ok) {
      onSaved(normalizeSector((await res.json()) as IndustrySector));
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4 border-t border-[var(--diq_border2)] bg-[var(--diq_deep)]/40 p-4">
      <AdminField label="Slug (URL)">
        <AdminInput
          value={slug}
          onChange={(v) => {
            setSlugTouched(true);
            setSlugManual(v);
          }}
          placeholder={autoSlug}
        />
      </AdminField>
      <p className="text-[11px] text-[var(--diq_mid)]">
        Public page: /industries/{slug || autoSlug}
      </p>
      <AdminField label="Eyebrow">
        <AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Industry eyebrow" />
      </AdminField>
      <AdminField label="Headline">
        <AdminInput value={headline} onChange={setHeadline} placeholder="Sector landing headline" />
      </AdminField>
      <AdminField label="Body">
        <AdminTextarea value={body} onChange={setBody} rows={4} placeholder="Differentiated sector narrative…" />
      </AdminField>
      <AdminField label="Hero image URL">
        <AdminInput value={heroImageUrl} onChange={setHeroImageUrl} placeholder="https://…" />
      </AdminField>

      <div>
        <div className="mb-2 text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Why this industry</div>
        <div className="space-y-3">
          {whyPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded border border-[var(--diq_border2)] p-3">
              <div className="flex shrink-0 flex-col gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (idx === 0) return;
                    const next = [...whyPoints];
                    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                    setWhyPoints(next);
                  }}
                  disabled={idx === 0}
                  className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (idx >= whyPoints.length - 1) return;
                    const next = [...whyPoints];
                    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                    setWhyPoints(next);
                  }}
                  disabled={idx === whyPoints.length - 1}
                  className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <AdminInput
                  value={point.title}
                  onChange={(v) => setWhyPoints((prev) => prev.map((p, i) => (i === idx ? { ...p, title: v } : p)))}
                  placeholder="Point title"
                />
                <AdminTextarea
                  value={point.body}
                  onChange={(v) => setWhyPoints((prev) => prev.map((p, i) => (i === idx ? { ...p, body: v } : p)))}
                  rows={2}
                  placeholder="Point body"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!confirm("Delete this point?")) return;
                  setWhyPoints((prev) => prev.filter((_, i) => i !== idx));
                }}
                className="text-xs text-[var(--destructive)] hover:opacity-80 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setWhyPoints((prev) => [...prev, { title: "", body: "" }])}
          className="mt-2 text-xs text-[var(--gold)] hover:underline"
        >
          + Add why-point
        </button>
      </div>

      <div>
        <div className="mb-2 text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">
          Case study refs <span className="normal-case tracking-normal text-[var(--diq_mid)]">(renders when case studies ship)</span>
        </div>
        <div className="space-y-3">
          {caseStudyRefs.map((ref, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded border border-[var(--diq_border2)] p-3">
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <AdminInput
                  value={ref.label}
                  onChange={(v) => setCaseStudyRefs((prev) => prev.map((r, i) => (i === idx ? { ...r, label: v } : r)))}
                  placeholder="Label"
                />
                <AdminInput
                  value={ref.href}
                  onChange={(v) => setCaseStudyRefs((prev) => prev.map((r, i) => (i === idx ? { ...r, href: v } : r)))}
                  placeholder="/blog/example or https://…"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!confirm("Delete this ref?")) return;
                  setCaseStudyRefs((prev) => prev.filter((_, i) => i !== idx));
                }}
                className="text-xs text-[var(--destructive)] hover:opacity-80 shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCaseStudyRefs((prev) => [...prev, { label: "", href: "" }])}
          className="mt-2 text-xs text-[var(--gold)] hover:underline"
        >
          + Add case study ref
        </button>
      </div>

      <AdminSaveButton onClick={savePage} saving={saving} />
    </div>
  );
}
