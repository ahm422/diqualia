"use client";

import { Suspense, useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  AdminEditableList,
  AdminSection,
  AdminField,
  AdminInput,
  AdminSaveButton,
  useAdminSave,
  useScrollToSection,
} from "@/components/admin";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

import type { BuiltForItem, BuiltForSection } from "../types";

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === "string") return body.error;
  } catch {
    /* fall through */
  }
  return "Save failed — try again";
}

const fieldLabel =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--diq_mid)]";
const fieldBox =
  "w-full rounded-lg border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3.5 py-2.5 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--gold)_35%,transparent)] disabled:opacity-60";

export function BuiltForEditor({
  initialSection,
  initial,
}: {
  initialSection: BuiltForSection;
  initial: BuiltForItem[];
}) {
  return (
    <Suspense fallback={null}>
      <BuiltForEditorInner initialSection={initialSection} initial={initial} />
    </Suspense>
  );
}

function BuiltForEditorInner({
  initialSection,
  initial,
}: {
  initialSection: BuiltForSection;
  initial: BuiltForItem[];
}) {
  useScrollToSection();

  return (
    <div>
      <BuiltForSectionHeader initial={initialSection} />
      <BuiltForItemsSection initial={initial} />
    </div>
  );
}

function BuiltForSectionHeader({ initial }: { initial: BuiltForSection }) {
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [line1, setLine1] = useState(initial?.headlineLine1 ?? "");
  const [line2, setLine2] = useState(initial?.headlineLine2 ?? "");
  const { save, saving } = useAdminSave("/api/admin/about-built-for-section");

  return (
    <AdminSection id="header" title="Section header">
      <AdminField label="Eyebrow">
        <AdminInput value={eyebrow} onChange={setEyebrow} placeholder="What we're built for" />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Headline Line 1">
          <AdminInput
            value={line1}
            onChange={setLine1}
            placeholder="Intelligence that compounds —"
          />
        </AdminField>
        <AdminField label="Headline Line 2">
          <AdminInput
            value={line2}
            onChange={setLine2}
            placeholder="not tactics that expire."
          />
        </AdminField>
      </div>
      <AdminSaveButton
        onClick={() => save({ eyebrow, headlineLine1: line1, headlineLine2: line2 })}
        saving={saving}
      />
    </AdminSection>
  );
}

function BuiltForItemsSection({ initial }: { initial: BuiltForItem[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
  const canEdit = useCan("content.edit");

  const [items, setItems] = useState<BuiltForItem[]>(initial);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  async function saveRow(row: BuiltForItem): Promise<BuiltForItem> {
    const res = await fetch(`/api/admin/about-built-for/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: row.title, description: row.description }),
    });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as BuiltForItem;
  }

  async function reorder(
    rows: BuiltForItem[],
    from: number,
    to: number,
  ): Promise<BuiltForItem[]> {
    const a = rows[from];
    const b = rows[to];
    const results = await Promise.all([
      fetch(`/api/admin/about-built-for/${a.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/about-built-for/${b.id}`, {
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

  async function del(row: BuiltForItem): Promise<BuiltForItem[]> {
    const res = await fetch(`/api/admin/about-built-for/${row.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete failed — try again");
    return items
      .filter((i) => i.id !== row.id)
      .map((i, idx) => ({ ...i, order: idx }));
  }

  async function add() {
    if (!newTitle.trim() || !newDesc.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/about-built-for", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      const item = (await res.json()) as BuiltForItem;
      setItems((prev) => [...prev, item]);
      setNewTitle("");
      setNewDesc("");
      toast.success("Saved");
    } catch {
      toast.error("Save failed — try again");
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminSection id="items" title="Built-For Items">
      <div className="mb-5 flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--gold)_20%,transparent)] bg-[color-mix(in_oklab,var(--gold)_7%,transparent)] px-4 py-3.5">
        <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
        <p className="text-xs leading-relaxed text-[var(--diq_mid)]">
          These cards appear in the “What we’re built for” grid on{" "}
          <span className="font-mono text-[var(--gold)]">/about#built-for</span> and as the
          principles grid on the homepage. Give each a short title and a one- or two-sentence
          description, and use the arrows to set the order. Changes go live after you save.
        </p>
      </div>

      <AdminEditableList<BuiltForItem>
        rows={items}
        onRowsChange={setItems}
        keyOf={(i) => i.id}
        canEdit={canEdit}
        canDelete={canDelete}
        canCreate={canCreate}
        itemNoun="card"
        addTitle="Add card"
        emptyText="No built-for cards yet"
        emptyHint="Add your first card below — it'll show in the grid on the About page and the homepage principles."
        emptyIcon={<LayoutGrid className="h-5 w-5" />}
        deleteConfirm="Delete this card?"
        onSave={saveRow}
        onReorder={reorder}
        onDelete={del}
        renderFields={(draft, setField, ctx) => (
          <div className="space-y-3">
            <div>
              <label className={fieldLabel}>Title</label>
              <input
                value={draft.title}
                disabled={ctx.disabled}
                onChange={(e) => setField({ title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ctx.saveIfDirty();
                  } else if (e.key === "Escape") {
                    ctx.revert();
                  }
                }}
                placeholder="Research Before Everything"
                className={fieldBox}
              />
            </div>
            <div>
              <label className={fieldLabel}>Description</label>
              <textarea
                value={draft.description}
                disabled={ctx.disabled}
                onChange={(e) => setField({ description: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Escape") ctx.revert();
                }}
                rows={2}
                placeholder="Every engagement begins with a deep dive into the problem space…"
                className={`${fieldBox} resize-y`}
              />
            </div>
          </div>
        )}
        addSlot={
          <div className="space-y-3">
            <div>
              <label className={fieldLabel}>Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Research Before Everything"
                className={fieldBox}
              />
            </div>
            <div>
              <label className={fieldLabel}>Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                placeholder="Every engagement begins with a deep dive into the problem space…"
                className={`${fieldBox} resize-y`}
              />
            </div>
            <button
              type="button"
              onClick={add}
              disabled={adding || !newTitle.trim() || !newDesc.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-pill bg-[var(--gold)] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--diq_ink)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[var(--gold-lt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {adding ? "Adding" : "Add card"}
            </button>
          </div>
        }
      />
    </AdminSection>
  );
}
