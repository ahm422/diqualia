"use client";

import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminEditableList, AdminSection } from "@/components/admin";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

import type { MarqueeItem } from "../types";

const fieldBox =
  "w-full rounded-lg border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3.5 py-2.5 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--gold)_35%,transparent)] disabled:opacity-60";

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === "string") return body.error;
  } catch {
    /* fall through */
  }
  return "Save failed — try again";
}

/** Split "Label — Sublabel" the same way the public ticker does. */
function splitTicker(text: string): { label: string; rest: string } {
  const i = text.indexOf(" — ");
  return i >= 0
    ? { label: text.slice(0, i), rest: text.slice(i) }
    : { label: text, rest: "" };
}

function TickerPreview({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const { label, rest } = splitTicker(trimmed);
  return (
    <div className="mt-2 flex items-center gap-3 overflow-hidden rounded-lg border border-[var(--diq_border2)] bg-[var(--diq_ink)] px-3.5 py-2.5">
      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_oklab,var(--diq_mid)_80%,transparent)]">
        Live preview
      </span>
      <span className="truncate font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--diq_mid)]">
        <span className="font-normal text-[var(--gold)]">{label}</span>
        {rest}
      </span>
    </div>
  );
}

export function MarqueeEditor({ initial }: { initial: MarqueeItem[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
  const canEdit = useCan("content.edit");

  const [items, setItems] = useState<MarqueeItem[]>(initial);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  async function saveRow(row: MarqueeItem): Promise<MarqueeItem> {
    const res = await fetch(`/api/admin/home-marquee/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: row.text }),
    });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as MarqueeItem;
  }

  async function reorder(
    rows: MarqueeItem[],
    from: number,
    to: number,
  ): Promise<MarqueeItem[]> {
    const a = rows[from];
    const b = rows[to];
    const results = await Promise.all([
      fetch(`/api/admin/home-marquee/${a.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/home-marquee/${b.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    if (results.some((r) => !r.ok)) throw new Error("Reorder failed — try again");
    return rows
      .map((r) => {
        if (r.id === a.id) return { ...r, order: b.order };
        if (r.id === b.id) return { ...r, order: a.order };
        return r;
      })
      .sort((x, y) => x.order - y.order);
  }

  async function del(row: MarqueeItem): Promise<MarqueeItem[]> {
    const res = await fetch(`/api/admin/home-marquee/${row.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete failed — try again");
    // Server re-packs `order` to array position; mirror that locally.
    return items
      .filter((i) => i.id !== row.id)
      .map((i, idx) => ({ ...i, order: idx }));
  }

  async function add() {
    if (!newText.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/home-marquee", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText.trim() }),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      const item = (await res.json()) as MarqueeItem;
      setItems((prev) => [...prev, item]);
      setNewText("");
      toast.success("Saved");
    } catch {
      toast.error("Save failed — try again");
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminSection title="Marquee Ticker">
      <div className="mb-5 flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--gold)_20%,transparent)] bg-[color-mix(in_oklab,var(--gold)_7%,transparent)] px-4 py-3.5">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
        <p className="text-xs leading-relaxed text-[var(--diq_mid)]">
          These lines scroll across the strip under the hero on the homepage. Write each one as{" "}
          <span className="font-mono text-[var(--gold)]">Label — Sublabel</span>: everything
          before the <span className="font-mono text-foreground">—</span> shows in gold, the
          rest stays muted. Reorder with the arrows; changes go live after you save.
        </p>
      </div>

      <AdminEditableList<MarqueeItem>
        rows={items}
        onRowsChange={setItems}
        keyOf={(i) => i.id}
        canEdit={canEdit}
        canDelete={canDelete}
        canCreate={canCreate}
        itemNoun="ticker item"
        addTitle="Add ticker item"
        emptyText="No ticker items yet"
        emptyHint="Add your first item below — it'll appear in the scrolling strip under the hero."
        emptyIcon={<Megaphone className="h-5 w-5" />}
        deleteConfirm="Delete this ticker item?"
        onSave={saveRow}
        onReorder={reorder}
        onDelete={del}
        renderFields={(draft, setField, ctx) => (
          <div>
            <input
              value={draft.text}
              disabled={ctx.disabled}
              onChange={(e) => setField({ text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  ctx.saveIfDirty();
                } else if (e.key === "Escape") {
                  ctx.revert();
                }
              }}
              placeholder="Market Research — Niche B2B Intelligence"
              className={fieldBox}
            />
            <TickerPreview text={draft.text} />
          </div>
        )}
        addSlot={
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void add();
                  }
                }}
                placeholder="Market Research — Niche B2B Intelligence"
                className={`min-w-0 flex-1 ${fieldBox}`}
              />
              <button
                type="button"
                onClick={add}
                disabled={adding || !newText.trim()}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill bg-[var(--gold)] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--diq_ink)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[var(--gold-lt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {adding ? "Adding" : "Add item"}
              </button>
            </div>
            <TickerPreview text={newText} />
          </div>
        }
      />
    </AdminSection>
  );
}
