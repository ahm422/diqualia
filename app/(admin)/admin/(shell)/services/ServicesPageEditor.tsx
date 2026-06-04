"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServicesPageData = {
  id: number;
  eyebrow: string; headline: string; body: string;
  stat1Value: string; stat1Label: string;
  stat2Value: string; stat2Label: string;
  stat3Value: string; stat3Label: string;
  stat4Value: string; stat4Label: string;
  ctaEyebrow: string; ctaHeadline: string; ctaBody: string;
  ctaBtn1Label: string; ctaBtn1Href: string; ctaEmailHref: string;
} | null;

type ServiceItem = {
  id: number; sectionId: number;
  groupLabel: string | null; title: string; body: string | null; order: number;
};

type ServiceSection = {
  id: number; tabId: string; order: number;
  eyebrow: string; title: string; body: string;
  cardTitle: string | null; cardBody: string | null;
  items: ServiceItem[];
};

type Props = {
  initialPage: ServicesPageData;
  initialSections: ServiceSection[];
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveStatus({ status }: { status: SaveState }) {
  if (status === "idle") return null;
  if (status === "saving") return <span className="text-xs text-[var(--diq_mid)]">Saving…</span>;
  if (status === "saved") return <span className="text-xs text-green-500">Saved ✓</span>;
  return <span className="text-xs text-red-400">Error — try again</span>;
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-[var(--diq_border)] bg-[var(--diq_surface)] p-6">
      <h2 className="mb-5 text-base font-medium text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-xs uppercase tracking-widest text-[var(--diq_mid)]">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
    />
  );
}

function SaveBtn({ onClick, status }: { onClick: () => void; status: SaveState }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        onClick={onClick}
        disabled={status === "saving"}
        className="rounded border border-[var(--gold)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50"
      >
        Save
      </button>
      <SaveStatus status={status} />
    </div>
  );
}

async function apiPatch(url: string, data: Record<string, unknown>) {
  return fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export function ServicesPageEditor({ initialPage, initialSections }: Props) {
  return (
    <div>
      <HeroBlock initial={initialPage} />
      <CtaBlock initial={initialPage} />
      <SectionsBlock initial={initialSections} />
    </div>
  );
}

// ─── Block A: Hero ────────────────────────────────────────────────────────────

function HeroBlock({ initial }: { initial: ServicesPageData }) {
  const [f, setF] = useState({
    eyebrow: initial?.eyebrow ?? "",
    headline: initial?.headline ?? "",
    body: initial?.body ?? "",
    stat1Value: initial?.stat1Value ?? "",
    stat1Label: initial?.stat1Label ?? "",
    stat2Value: initial?.stat2Value ?? "",
    stat2Label: initial?.stat2Label ?? "",
    stat3Value: initial?.stat3Value ?? "",
    stat3Label: initial?.stat3Label ?? "",
    stat4Value: initial?.stat4Value ?? "",
    stat4Label: initial?.stat4Label ?? "",
  });
  const [status, setStatus] = useState<SaveState>("idle");
  const set = (key: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [key]: v }));

  async function save() {
    setStatus("saving");
    const res = await apiPatch("/api/admin/services-page", f);
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <AdminSection title="Hero">
      <Field label="Eyebrow"><Input value={f.eyebrow} onChange={set("eyebrow")} placeholder="Our Intelligence Services" /></Field>
      <Field label="Headline"><Input value={f.headline} onChange={set("headline")} placeholder="What We Do for You." /></Field>
      <Field label="Body"><Textarea value={f.body} onChange={set("body")} rows={3} /></Field>
      <div className="mt-2 mb-2 text-xs uppercase tracking-widest text-[var(--diq_mid)]">Stats</div>
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["stat1Value", "stat1Label", "6", "Core Services"],
          ["stat2Value", "stat2Label", "94%", "Lead Quality Rate"],
          ["stat3Value", "stat3Label", "3.8x", "Pipeline Growth"],
          ["stat4Value", "stat4Label", "~21d", "First Qualified Lead"],
        ] as const).map(([vk, lk, vp, lp]) => (
          <div key={vk} className="rounded border border-[var(--diq_border2)] p-3">
            <Field label="Value"><Input value={f[vk]} onChange={set(vk)} placeholder={vp} /></Field>
            <Field label="Label"><Input value={f[lk]} onChange={set(lk)} placeholder={lp} /></Field>
          </div>
        ))}
      </div>
      <SaveBtn onClick={save} status={status} />
    </AdminSection>
  );
}

// ─── Block B: CTA Strip ───────────────────────────────────────────────────────

function CtaBlock({ initial }: { initial: ServicesPageData }) {
  const [f, setF] = useState({
    ctaEyebrow: initial?.ctaEyebrow ?? "",
    ctaHeadline: initial?.ctaHeadline ?? "",
    ctaBody: initial?.ctaBody ?? "",
    ctaBtn1Label: initial?.ctaBtn1Label ?? "",
    ctaBtn1Href: initial?.ctaBtn1Href ?? "",
    ctaEmailHref: initial?.ctaEmailHref ?? "",
  });
  const [status, setStatus] = useState<SaveState>("idle");
  const set = (key: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [key]: v }));

  async function save() {
    setStatus("saving");
    const res = await apiPatch("/api/admin/services-page", f);
    setStatus(res.ok ? "saved" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <AdminSection title="CTA Strip">
      <Field label="Eyebrow"><Input value={f.ctaEyebrow} onChange={set("ctaEyebrow")} placeholder="Begin With Intelligence" /></Field>
      <Field label="Headline"><Input value={f.ctaHeadline} onChange={set("ctaHeadline")} placeholder="Ready to Start?" /></Field>
      <Field label="Body"><Textarea value={f.ctaBody} onChange={set("ctaBody")} rows={2} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Button Label"><Input value={f.ctaBtn1Label} onChange={set("ctaBtn1Label")} placeholder="Contact" /></Field>
        <Field label="Button Href"><Input value={f.ctaBtn1Href} onChange={set("ctaBtn1Href")} placeholder="/contact" /></Field>
        <Field label="Email (mailto)"><Input value={f.ctaEmailHref} onChange={set("ctaEmailHref")} placeholder="intel@diqualia.com" /></Field>
      </div>
      <SaveBtn onClick={save} status={status} />
    </AdminSection>
  );
}

// ─── Block C+D: Sections accordion ───────────────────────────────────────────

function SectionsBlock({ initial }: { initial: ServiceSection[] }) {
  const [sections, setSections] = useState<ServiceSection[]>(initial);
  const [openId, setOpenId] = useState<number | null>(null);
  const [newTabId, setNewTabId] = useState("");
  const [newEyebrow, setNewEyebrow] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  async function patchSection(id: number, data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/service-sections/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    }
    return res;
  }

  async function moveSection(id: number, dir: -1 | 1) {
    const idx = sections.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sections.length) return;
    const a = sections[idx]; const b = sections[swapIdx];
    await Promise.all([
      patchSection(a.id, { order: b.order }),
      patchSection(b.id, { order: a.order }),
    ]);
    const next = [...sections];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setSections(next.sort((x, y) => x.order - y.order));
  }

  async function deleteSection(id: number) {
    if (!confirm("Delete this section and all its items?")) return;
    const res = await fetch(`/api/admin/service-sections/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      setSections((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
      if (openId === id) setOpenId(null);
    }
  }

  async function addSection() {
    if (!newTabId.trim() || !newTitle.trim() || !newEyebrow.trim() || !newBody.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/service-sections", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabId: newTabId, eyebrow: newEyebrow, title: newTitle, body: newBody }),
    });
    if (res.ok) {
      const section = await res.json();
      setSections((prev) => [...prev, section]);
      setNewTabId(""); setNewEyebrow(""); setNewTitle(""); setNewBody("");
    }
    setAdding(false);
  }

  function updateSectionItems(sectionId: number, items: ServiceItem[]) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, items } : s)));
  }

  return (
    <AdminSection title="Service Sections">
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <SectionPanel
            key={section.id}
            section={section}
            idx={idx}
            total={sections.length}
            isOpen={openId === section.id}
            onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            onPatch={(data) => patchSection(section.id, data)}
            onMove={(dir) => moveSection(section.id, dir)}
            onDelete={() => deleteSection(section.id)}
            onItemsChange={(items) => updateSectionItems(section.id, items)}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-[var(--diq_border2)] pt-5">
        <div className="text-xs uppercase tracking-widest text-[var(--diq_mid)] mb-3">Add section</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tab ID (unique, e.g. s07)"><Input value={newTabId} onChange={setNewTabId} placeholder="s07" /></Field>
          <Field label="Eyebrow"><Input value={newEyebrow} onChange={setNewEyebrow} placeholder="Intelligence Service Seven" /></Field>
          <Field label="Title"><Input value={newTitle} onChange={setNewTitle} placeholder="New Service Title" /></Field>
          <Field label="Body"><Textarea value={newBody} onChange={setNewBody} rows={2} placeholder="Service description…" /></Field>
        </div>
        <button
          onClick={addSection}
          disabled={adding || !newTabId.trim() || !newTitle.trim() || !newEyebrow.trim() || !newBody.trim()}
          className="mt-3 rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50"
        >
          Add Section
        </button>
      </div>
    </AdminSection>
  );
}

// ─── Section accordion panel ──────────────────────────────────────────────────

type SectionPanelProps = {
  section: ServiceSection;
  idx: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onPatch: (data: Record<string, unknown>) => Promise<Response>;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onItemsChange: (items: ServiceItem[]) => void;
};

function SectionPanel({ section, idx, total, isOpen, onToggle, onPatch, onMove, onDelete, onItemsChange }: SectionPanelProps) {
  const [sectionStatus, setSectionStatus] = useState<SaveState>("idle");

  async function saveSection() {
    setSectionStatus("saving");
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(`[data-section-field="${section.id}"]`);
    const data: Record<string, unknown> = {};
    inputs.forEach((el) => { data[el.name] = el.value || null; });
    const res = await onPatch(data);
    setSectionStatus(res.ok ? "saved" : "error");
    setTimeout(() => setSectionStatus("idle"), 2500);
  }

  return (
    <div className="rounded border border-[var(--diq_border2)]">
      {/* Accordion header */}
      <div className="flex items-center gap-2 p-4">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-left">
          <span className="text-sm font-medium text-foreground">{section.title}</span>
          <span className="rounded bg-[var(--diq_deep)] px-2 py-0.5 font-mono text-[10px] text-[var(--diq_mid)]">{section.tabId}</span>
          <span className="ml-auto text-[var(--diq_mid)]">{isOpen ? "▲" : "▼"}</span>
        </button>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onMove(-1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
          <button onClick={onDelete} className="ml-2 text-xs text-red-400 hover:text-red-300">Delete</button>
        </div>
      </div>

      {/* Accordion body */}
      {isOpen && (
        <div className="border-t border-[var(--diq_border2)] p-4">
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Tab ID</label>
              <input name="tabId" defaultValue={section.tabId} data-section-field={section.id}
                className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 font-mono text-sm focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Eyebrow</label>
              <input name="eyebrow" defaultValue={section.eyebrow} data-section-field={section.id}
                className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
              <input name="title" defaultValue={section.title} data-section-field={section.id}
                className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
              <textarea name="body" defaultValue={section.body} data-section-field={section.id} rows={3}
                className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Card Title (optional, enables S01 layout)</label>
              <input name="cardTitle" defaultValue={section.cardTitle ?? ""} data-section-field={section.id}
                placeholder="Leave empty for S02+ grid layout"
                className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Card Body (optional)</label>
              <textarea name="cardBody" defaultValue={section.cardBody ?? ""} data-section-field={section.id} rows={2}
                className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={saveSection}
              disabled={sectionStatus === "saving"}
              className="rounded border border-[var(--gold)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50"
            >
              Save Section
            </button>
            <SaveStatus status={sectionStatus} />
          </div>

          {/* Items */}
          <ItemsEditor section={section} onItemsChange={onItemsChange} />
        </div>
      )}
    </div>
  );
}

// ─── Items editor ─────────────────────────────────────────────────────────────

function ItemsEditor({ section, onItemsChange }: { section: ServiceSection; onItemsChange: (items: ServiceItem[]) => void }) {
  const [items, setItems] = useState<ServiceItem[]>(section.items);
  const [newGroupLabel, setNewGroupLabel] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  function syncItems(next: ServiceItem[]) {
    setItems(next);
    onItemsChange(next);
  }

  async function patchItem(id: number, data: Record<string, unknown>) {
    const res = await fetch(`/api/admin/service-sections/${section.id}/items/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      syncItems(items.map((i) => (i.id === id ? updated : i)));
    }
  }

  async function moveItem(id: number, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx]; const b = items[swapIdx];
    await Promise.all([
      fetch(`/api/admin/service-sections/${section.id}/items/${a.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: b.order }) }),
      fetch(`/api/admin/service-sections/${section.id}/items/${b.id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: a.order }) }),
    ]);
    const next = [...items];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    syncItems(next.sort((x, y) => x.order - y.order));
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/service-sections/${section.id}/items/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) syncItems(items.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx })));
  }

  async function addItem() {
    if (!newTitle.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/admin/service-sections/${section.id}/items`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        groupLabel: newGroupLabel.trim() || null,
        body: newBody.trim() || null,
      }),
    });
    if (res.ok) {
      const item = await res.json();
      syncItems([...items, item]);
      setNewTitle(""); setNewGroupLabel(""); setNewBody("");
    }
    setAdding(false);
  }

  return (
    <div className="border-t border-[var(--diq_border2)] pt-4">
      <div className="text-xs uppercase tracking-widest text-[var(--diq_mid)] mb-3">Items</div>
      <p className="mb-3 text-[11px] text-[var(--diq_mid)]">
        S01 layout: items with no groupLabel + body = right feature boxes; groupLabel &quot;What You Receive&quot; + no body = bullet list.
        S02+ layout: group items by groupLabel; first item (with body) = card; following items (no body) = deliverables.
      </p>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded border border-[var(--diq_border2)] bg-[var(--diq_deep)] p-3">
            <div className="grid gap-2 sm:grid-cols-3 mb-2">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">Group Label</label>
                <input
                  defaultValue={item.groupLabel ?? ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim() || null;
                    if (val !== item.groupLabel) patchItem(item.id, { groupLabel: val });
                  }}
                  placeholder="e.g. 02 · A or What You Receive"
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_surface)] px-2 py-1 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">Title *</label>
                <input
                  defaultValue={item.title}
                  onBlur={(e) => { if (e.target.value !== item.title) patchItem(item.id, { title: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_surface)] px-2 py-1 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">Body (empty = deliverable bullet)</label>
                <input
                  defaultValue={item.body ?? ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim() || null;
                    if (val !== item.body) patchItem(item.id, { body: val });
                  }}
                  placeholder="Leave empty for deliverable bullet"
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_surface)] px-2 py-1 text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => moveItem(item.id, -1)} disabled={idx === 0} className="text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
              <button onClick={() => moveItem(item.id, 1)} disabled={idx === items.length - 1} className="text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
              <button onClick={() => deleteItem(item.id)} className="ml-auto text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--diq_border2)] pt-3">
        <div className="text-[10px] uppercase tracking-widest text-[var(--diq_mid)] mb-2">Add item</div>
        <div className="grid gap-2 sm:grid-cols-3 mb-2">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">Group Label</label>
            <input value={newGroupLabel} onChange={(e) => setNewGroupLabel(e.target.value)} placeholder="optional"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">Title *</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Item title"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
            <input value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="optional"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
        </div>
        <button onClick={addItem} disabled={adding || !newTitle.trim()}
          className="rounded border border-[var(--gold)] px-3 py-1 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add Item
        </button>
      </div>
    </div>
  );
}
