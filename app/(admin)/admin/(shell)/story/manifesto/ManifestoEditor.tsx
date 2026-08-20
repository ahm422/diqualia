"use client";

import { useState } from "react";

import { AdminSection, AdminSaveButton, useAdminSave } from "@/components/admin";

import type { StoryPageData } from "../types";

export function ManifestoEditor({ initial }: { initial: StoryPageData }) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(initial?.manifestoItems)
      ? (initial.manifestoItems as string[]).filter(Boolean)
      : []
  );
  const { save, saving } = useAdminSave("/api/admin/story-page");

  function update(idx: number, val: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? val : it)));
  }

  function remove(idx: number) {
    if (!confirm("Delete this manifesto item?")) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    const next = [...items];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setItems(next);
  }

  function addItem() {
    setItems((prev) => [...prev, ""]);
  }

  return (
    <AdminSection title="Manifesto Items">
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 rounded border border-[var(--diq_border2)] p-3"
          >
            <div className="flex shrink-0 flex-col gap-1 pt-1">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded px-1 text-xs text-[var(--diq_mid)] hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            <textarea
              value={item}
              onChange={(e) => update(idx, e.target.value)}
              rows={2}
              className="flex-1 resize-y rounded border border-[var(--diq_border)] bg-[var(--diq_deep)] px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
            />
            <button
              onClick={() => remove(idx)}
              className="shrink-0 pt-1 text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 rounded border border-[var(--diq_border)] px-3 py-1.5 text-xs uppercase tracking-widest text-[var(--diq_mid)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
      >
        + Add item
      </button>

      <AdminSaveButton onClick={() => save({ manifestoItems: items })} saving={saving} />
    </AdminSection>
  );
}
