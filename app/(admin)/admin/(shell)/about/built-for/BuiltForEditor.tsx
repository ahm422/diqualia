"use client";

import { useState } from "react";

import { AdminSection } from "@/components/admin";

import type { BuiltForItem } from "../types";

export function BuiltForEditor({ initial }: { initial: BuiltForItem[] }) {
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
      const updated = (await res.json()) as BuiltForItem;
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
      const item = (await res.json()) as BuiltForItem;
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
