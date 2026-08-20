"use client";

import { Suspense, useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
  useAdminSectionTab,
} from "@/components/admin";
import { slugify } from "@/lib/slugify";

// ─── Types ────────────────────────────────────────────────────────────────────

type IndustriesPageData = {
  id: number;
  eyebrow: string; headlineLine1: string; headlineLine2: string; body: string;
  sectorsLabel: string; sectorsDescription: string;
  sidebarLabel: string; sidebarCopy: string;
  whereNextEyebrow: string; whereNextTitle1: string; whereNextTitle2: string; whereNextBody: string;
} | null;

type WhyPoint = { title: string; body: string };
type CaseStudyRef = { label: string; href: string };

type IndustrySector = {
  id: number;
  slug: string;
  name: string;
  visible: boolean;
  order: number;
  eyebrow: string | null;
  headline: string | null;
  body: string | null;
  heroImageUrl: string | null;
  whyPoints: WhyPoint[] | null;
  caseStudyRefs: CaseStudyRef[] | null;
};

type Props = {
  initialPage: IndustriesPageData;
  initialSectors: IndustrySector[];
};

function parseWhyPoints(value: unknown): WhyPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is WhyPoint =>
      item != null &&
      typeof item === "object" &&
      typeof (item as WhyPoint).title === "string" &&
      typeof (item as WhyPoint).body === "string",
    )
    .map((item) => ({ title: item.title, body: item.body }));
}

function parseCaseStudyRefs(value: unknown): CaseStudyRef[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is CaseStudyRef =>
      item != null &&
      typeof item === "object" &&
      typeof (item as CaseStudyRef).label === "string" &&
      typeof (item as CaseStudyRef).href === "string",
    )
    .map((item) => ({ label: item.label, href: item.href }));
}

function normalizeSector(raw: IndustrySector): IndustrySector {
  return {
    ...raw,
    whyPoints: parseWhyPoints(raw.whyPoints),
    caseStudyRefs: parseCaseStudyRefs(raw.caseStudyRefs),
  };
}

// ─── Main editor ─────────────────────────────────────────────────────────────

const INDUSTRIES_TABS = ["hero", "sectors", "where-next"] as const;
type Tab = (typeof INDUSTRIES_TABS)[number];

export function IndustriesPageEditor(props: Props) {
  return (
    <Suspense fallback={null}>
      <IndustriesPageEditorInner {...props} />
    </Suspense>
  );
}

function IndustriesPageEditorInner({ initialPage, initialSectors }: Props) {
  const { activeTab, setTab } = useAdminSectionTab(INDUSTRIES_TABS, "hero");

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "sectors", label: "Sectors" },
    { id: "where-next", label: "Where Next" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-[var(--diq_border)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`rounded px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
              activeTab === tab.id
                ? "border border-[var(--gold)] text-[var(--gold)]"
                : "border border-[var(--diq_border)] text-[var(--diq_mid)] hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "hero" && <HeroTab initial={initialPage} />}
      {activeTab === "sectors" && (
        <SectorsTab
          initialPage={initialPage}
          initialSectors={initialSectors.map(normalizeSector)}
        />
      )}
      {activeTab === "where-next" && <WhereNextTab initial={initialPage} />}
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroTab({ initial }: { initial: IndustriesPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [line1, setLine1] = useState(initial?.headlineLine1 ?? "");
  const [line2, setLine2] = useState(initial?.headlineLine2 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/industries-page");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Industries" /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Headline Line 1"><AdminInput value={line1} onChange={setLine1} placeholder="Deep expertise." /></AdminField>
        <AdminField label="Headline Line 2 (italic)"><AdminInput value={line2} onChange={setLine2} placeholder="Broad reach." /></AdminField>
      </div>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={3} placeholder="We operate across…" /></AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1: line1, headlineLine2: line2, body })} saving={saving} />
    </AdminSection>
  );
}

// ─── Sectors tab ──────────────────────────────────────────────────────────────

function SectorsTab({ initialPage, initialSectors }: { initialPage: IndustriesPageData; initialSectors: IndustrySector[] }) {
  const [sectorsLabel, setSectorsLabel] = useState(initialPage?.sectorsLabel ?? "");
  const [sectorsDescription, setSectorsDescription] = useState(initialPage?.sectorsDescription ?? "");
  const [sidebarLabel, setSidebarLabel] = useState(initialPage?.sidebarLabel ?? "");
  const [sidebarCopy, setSidebarCopy] = useState(initialPage?.sidebarCopy ?? "");
  const { save: saveCopy, saving: copyStatus } = useAdminSave("/api/admin/industries-page");

  const [sectors, setSectors] = useState<IndustrySector[]>(initialSectors);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      <AdminSection title="Sectors copy">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Sectors Label"><AdminInput value={sectorsLabel} onChange={setSectorsLabel} placeholder="Sectors we actively research" /></AdminField>
          <AdminField label="Sidebar Label"><AdminInput value={sidebarLabel} onChange={setSidebarLabel} placeholder="Active research" /></AdminField>
          <AdminField label="Sectors Description"><AdminTextarea value={sectorsDescription} onChange={setSectorsDescription} rows={2} /></AdminField>
          <AdminField label="Sidebar Copy"><AdminTextarea value={sidebarCopy} onChange={setSidebarCopy} rows={2} /></AdminField>
        </div>
        <AdminSaveButton onClick={() => saveCopy({ sectorsLabel, sectorsDescription, sidebarLabel, sidebarCopy })} saving={copyStatus} />
      </AdminSection>

      <AdminSection title="Sector tags">
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
                <button type="button" onClick={() => del(sector.id)} className="text-xs text-red-400 hover:text-red-300 shrink-0">Delete</button>
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
                className="text-xs text-red-400 hover:text-red-300 shrink-0"
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
                className="text-xs text-red-400 hover:text-red-300 shrink-0"
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

// ─── Where Next tab ──────────────────────────────────────────────────────────

function WhereNextTab({ initial }: { initial: IndustriesPageData }) {
  const [eyebrow, setEyebrow] = useState(initial?.whereNextEyebrow ?? "");
  const [title1, setTitle1] = useState(initial?.whereNextTitle1 ?? "");
  const [title2, setTitle2] = useState(initial?.whereNextTitle2 ?? "");
  const [body, setBody] = useState(initial?.whereNextBody ?? "");
  const { save, saving } = useAdminSave("/api/admin/industries-page");

  return (
    <AdminSection title="Where Next CTA">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Start here" /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Title Line 1"><AdminInput value={title1} onChange={setTitle1} placeholder="Tell us your niche —" /></AdminField>
        <AdminField label="Title Line 2"><AdminInput value={title2} onChange={setTitle2} placeholder="we'll map your buyers." /></AdminField>
      </div>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={3} /></AdminField>
      <AdminSaveButton onClick={() => save({ whereNextEyebrow: eyebrow, whereNextTitle1: title1, whereNextTitle2: title2, whereNextBody: body })} saving={saving} />
    </AdminSection>
  );
}
