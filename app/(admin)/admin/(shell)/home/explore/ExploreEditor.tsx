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

import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

import type { ExploreCard, ExploreSection } from "../types";

export function ExploreEditor({
  initialSection,
  initialCards,
}: {
  initialSection: ExploreSection;
  initialCards: ExploreCard[];
}) {
  return (
    <div>
      <ExploreSectionHeader initial={initialSection} />
      <ExploreCardsSection initial={initialCards} />
    </div>
  );
}

function ExploreSectionHeader({ initial }: { initial: ExploreSection }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [line1, setLine1] = useState(initial?.headlineLine1 ?? "");
  const [line2, setLine2] = useState(initial?.headlineLine2 ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const { save, saving } = useAdminSave("/api/admin/home-explore-section");

  return (
    <AdminSection title="Explore Section Header">
      <AdminField label="Eyebrow"><AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Explore" /></AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Headline Line 1"><AdminInput value={line1} onChange={setLine1} placeholder="A multi-page site" /></AdminField>
        <AdminField label="Headline Line 2"><AdminInput value={line2} onChange={setLine2} placeholder="built for clarity." /></AdminField>
      </div>
      <AdminField label="Subtext"><AdminTextarea value={body} onChange={setBody} rows={2} /></AdminField>
      <AdminSaveButton onClick={() => save({ eyebrow, headlineLine1: line1, headlineLine2: line2, body })} saving={saving} />
    </AdminSection>
  );
}

function ExploreCardsSection({ initial }: { initial: ExploreCard[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
  const [cards, setCards] = useState<ExploreCard[]>(initial);
  const [newHref, setNewHref] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<ExploreCard>) {
    const res = await fetch(`/api/admin/home-explore/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = (await res.json()) as ExploreCard;
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }

  async function move(id: number, dir: -1 | 1) {
    const idx = cards.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= cards.length) return;
    const a = cards[idx]; const b = cards[swapIdx];
    await Promise.all([patch(a.id, { order: b.order }), patch(b.id, { order: a.order })]);
    const next = [...cards];
    next[idx] = { ...a, order: b.order };
    next[swapIdx] = { ...b, order: a.order };
    setCards(next.sort((x, y) => x.order - y.order));
  }

  async function del(id: number) {
    if (!confirm("Delete this explore card?")) return;
    const res = await fetch(`/api/admin/home-explore/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setCards((prev) => prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })));
  }

  async function add() {
    if (!newHref || !newTitle || !newBody) return;
    setAdding(true);
    const res = await fetch("/api/admin/home-explore", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ href: newHref, title: newTitle, body: newBody }),
    });
    if (res.ok) { const card = (await res.json()) as ExploreCard; setCards((prev) => [...prev, card]); setNewHref(""); setNewTitle(""); setNewBody(""); }
    setAdding(false);
  }

  return (
    <AdminSection title="Explore Cards">
      <div className="space-y-4">
        {cards.map((card, idx) => (
          <div key={card.id} className="rounded border border-[var(--diq_border2)] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
                <input defaultValue={card.title} onBlur={(e) => { if (e.target.value !== card.title) patch(card.id, { title: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Href</label>
                <input defaultValue={card.href} onBlur={(e) => { if (e.target.value !== card.href) patch(card.id, { href: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm font-mono focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
                <input defaultValue={card.body} onBlur={(e) => { if (e.target.value !== card.body) patch(card.id, { body: e.target.value }); }}
                  className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input type="checkbox" checked={card.visible} onChange={() => patch(card.id, { visible: !card.visible })} className="accent-[var(--gold)]" />
                Visible on site
              </label>
              <div className="flex gap-1">
                <button onClick={() => move(card.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↑</button>
                <button onClick={() => move(card.id, 1)} disabled={idx === cards.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30 text-xs">↓</button>
              </div>
              {canDelete && (
                <button onClick={() => del(card.id)} className="text-xs text-red-400 hover:text-red-300 ml-auto">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {canCreate && (
      <div className="mt-4 border-t border-[var(--diq_border2)] pt-4">
        <div className="text-xs uppercase tracking-widest text-[var(--diq_mid)] mb-3">Add card</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Title</label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="About"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Href</label>
            <input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/about"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">Body</label>
            <input value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="What DiQualia is…"
              className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
          </div>
        </div>
        <button onClick={add} disabled={adding || !newHref || !newTitle || !newBody}
          className="mt-3 rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add Card
        </button>
      </div>
      )}
    </AdminSection>
  );
}
