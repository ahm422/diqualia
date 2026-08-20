"use client";

import { useState } from "react";

import { AdminSection } from "@/components/admin";

import type { MarqueeItem } from "../types";

export function MarqueeEditor({ initial }: { initial: MarqueeItem[] }) {
  const [items, setItems] = useState<MarqueeItem[]>(initial);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  async function patch(id: number, data: Partial<MarqueeItem>) {
    const res = await fetch(`/api/admin/home-marquee/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = (await res.json()) as MarqueeItem;
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
    if (!confirm("Delete this ticker item?")) return;
    const res = await fetch(`/api/admin/home-marquee/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx })));
  }

  async function add() {
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/home-marquee", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    if (res.ok) { const item = (await res.json()) as MarqueeItem; setItems((prev) => [...prev, item]); setNewText(""); }
    setAdding(false);
  }

  return (
    <AdminSection title="Marquee Ticker">
      <p className="mb-4 text-xs text-[var(--diq_mid)]">Format: &quot;Label — Sublabel&quot; (bold/rest split on &quot; — &quot;)</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--diq_border)] text-left text-xs uppercase tracking-wider text-[var(--diq_mid)]">
              <th className="pb-2 pr-4">Text</th>
              <th className="pb-2 pr-4">Order</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-[var(--diq_border2)] last:border-0">
                <td className="py-2 pr-4">
                  <input
                    defaultValue={item.text}
                    onBlur={(e) => { if (e.target.value !== item.text) patch(item.id, { text: e.target.value }); }}
                    className="w-full rounded border border-transparent bg-transparent px-1 text-sm focus:border-[var(--diq_border)] focus:outline-none"
                  />
                </td>
                <td className="py-2 pr-4">
                  <div className="flex gap-1">
                    <button onClick={() => move(item.id, -1)} disabled={idx === 0} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30">↑</button>
                    <button onClick={() => move(item.id, 1)} disabled={idx === items.length - 1} className="rounded px-1 text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30">↓</button>
                  </div>
                </td>
                <td className="py-2">
                  <button onClick={() => del(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-[var(--diq_border2)] pt-4">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]">New item</label>
          <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Market Research — Niche B2B Intelligence"
            className="w-full rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]" />
        </div>
        <button onClick={add} disabled={adding || !newText.trim()}
          className="rounded border border-[var(--gold)] px-4 py-1.5 text-xs uppercase tracking-widest text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--diq_ink)] disabled:opacity-50">
          Add
        </button>
      </div>
    </AdminSection>
  );
}
