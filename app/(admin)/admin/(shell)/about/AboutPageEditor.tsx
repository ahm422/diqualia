"use client";

import { useState } from "react";

import {
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
} from "@/components/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

type AboutHero = { id: number; eyebrow: string; headline: string; body: string } | null;
type BuiltForItem = { id: number; title: string; description: string; order: number };
type AboutWhereNext = {
  id: number; eyebrow: string; headline: string;
  btn1Label: string; btn1Href: string;
  btn2Label: string; btn2Href: string;
} | null;

type Props = {
  initialHero: AboutHero;
  initialBuiltFor: BuiltForItem[];
  initialWhereNext: AboutWhereNext;
};

// ─── Main editor ─────────────────────────────────────────────────────────────

type Tab = "hero" | "builtFor" | "whereNext";

export function AboutPageEditor({ initialHero, initialBuiltFor, initialWhereNext }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  const tabs: { id: Tab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "builtFor", label: "Built For" },
    { id: "whereNext", label: "Where Next" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-[var(--diq_border)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {activeTab === "hero" && <HeroSection initial={initialHero} />}
      {activeTab === "builtFor" && <BuiltForSection initial={initialBuiltFor} />}
      {activeTab === "whereNext" && <WhereNextSection initial={initialWhereNext} />}
    </div>
  );
}

// ─── Hero tab ─────────────────────────────────────────────────────────────────

function HeroSection({ initial }: { initial: AboutHero }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/about-hero");

  return (
    <AdminSection title="Hero">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="About" /></AdminField>
      <AdminField label="Headline"><AdminInput value={headline} onChange={setHeadline} placeholder="Not an agency. An intelligence unit." /></AdminField>
      <AdminField label="Body"><AdminTextarea value={body} onChange={setBody} rows={4} placeholder="DiQualia operates at the intersection of…" /></AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headline, body })} saving={saving} />
    </AdminSection>
  );
}

// ─── Built For tab ────────────────────────────────────────────────────────────

function BuiltForSection({ initial }: { initial: BuiltForItem[] }) {
  const [items, setItems] = useState<BuiltForItem[]>(initial);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<BuiltForItem>) {
    const res = await fetch(`/api/admin/about-built-for/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= items.length) return;
    const a = items[idx]; const b = items[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    const next = [...items];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setItems(next.sort((x, y) => x.order - y.order));
  }

  async function del(id: number) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/about-built-for/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx })));
  }

  async function add() {
    if (!newTitle.trim() || !newDesc.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/about-built-for", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDesc }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setNewTitle("");
      setNewDesc("");
    }
    setAdding(false);
  }

  return (
    <AdminSection title="Built For Items">
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded border border-[var(--diq_border2)] p-4">
            <div className="mb-2">
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
              <input
                defaultValue={item.title}
                onBlur={(e) => { if (e.target.value !== item.title) patch(item.id, { title: e.target.value }); }}
                className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Description</label>
              <textarea
                defaultValue={item.description}
                onBlur={(e) => { if (e.target.value !== item.description) patch(item.id, { description: e.target.value }); }}
                rows={2}
                className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <button onClick={() => move(item.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
                <button onClick={() => move(item.id, 1)} disabled={idx === items.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
              </div>
              <button onClick={() => del(item.id)} className="ml-auto text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[var(--diq_border2)] pt-4">
        <div className="text-xs uppercase tracking-widest text-[var(--diq_mid)] mb-3">Add item</div>
        <div className="mb-2">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Research Before Everything"
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Description</label>
          <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Every engagement begins with…" rows={2}
            className="w-full resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <button onClick={add} disabled={adding || !newTitle.trim() || !newDesc.trim()}
          className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add Item
        </button>
      </div>
    </AdminSection>
  );
}

// ─── Where Next tab ──────────────────────────────────────────────────────────

function WhereNextSection({ initial }: { initial: AboutWhereNext }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [btn1Label, setBtn1Label] = useState(initial?.btn1Label ?? "");
  const [btn1Href, setBtn1Href] = useState(initial?.btn1Href ?? "");
  const [btn2Label, setBtn2Label] = useState(initial?.btn2Label ?? "");
  const [btn2Href, setBtn2Href] = useState(initial?.btn2Href ?? "");
  const { save, saving } = useAdminSave("/api/admin/about-where-next");

  return (
    <AdminSection title="Where Next CTA">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Where next" /></AdminField>
      <AdminField label="Headline"><AdminInput value={headline} onChange={setHeadline} placeholder="See how we work — then start with intelligence." /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Button 1 Label"><AdminInput value={btn1Label} onChange={setBtn1Label} placeholder="How We Work" /></AdminField>
        <AdminField label="Button 1 Href"><AdminInput value={btn1Href} onChange={setBtn1Href} placeholder="/process" /></AdminField>
        <AdminField label="Button 2 Label"><AdminInput value={btn2Label} onChange={setBtn2Label} placeholder="Contact" /></AdminField>
        <AdminField label="Button 2 Href"><AdminInput value={btn2Href} onChange={setBtn2Href} placeholder="/contact" /></AdminField>
      </div>
      <AdminSaveButton onClick={() => save({ eyebrow, headline, btn1Label, btn1Href, btn2Label, btn2Href })} saving={saving} />
    </AdminSection>
  );
}
