"use client";

import { Suspense, useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  AdminEditableList,
  AdminSection,
  AdminField,
  AdminInput,
  AdminTextarea,
  AdminSaveButton,
  useAdminSave,
  useScrollToSection,
} from "@/components/admin";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

import type { ExploreCard, ExploreSection } from "../types";

const fieldLabel =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--diq_mid)]";
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

export function ExploreEditor({
  initialSection,
  initialCards,
}: {
  initialSection: ExploreSection;
  initialCards: ExploreCard[];
}) {
  return (
    <Suspense fallback={null}>
      <ExploreEditorInner initialSection={initialSection} initialCards={initialCards} />
    </Suspense>
  );
}

function ExploreEditorInner({
  initialSection,
  initialCards,
}: {
  initialSection: ExploreSection;
  initialCards: ExploreCard[];
}) {
  useScrollToSection();

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
    <AdminSection id="header" title="Explore Section Header">
      <AdminField label="Eyebrow">
        <AdminInput value={eyebrow} onChange={setEyebrow} placeholder="Explore" />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Headline Line 1">
          <AdminInput value={line1} onChange={setLine1} placeholder="A multi-page site" />
        </AdminField>
        <AdminField label="Headline Line 2">
          <AdminInput value={line2} onChange={setLine2} placeholder="built for clarity." />
        </AdminField>
      </div>
      <AdminField label="Subtext">
        <AdminTextarea value={body} onChange={setBody} rows={2} />
      </AdminField>
      <AdminSaveButton
        onClick={() => save({ eyebrow, headlineLine1: line1, headlineLine2: line2, body })}
        saving={saving}
      />
    </AdminSection>
  );
}

function ExploreCardsSection({ initial }: { initial: ExploreCard[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
  const canEdit = useCan("content.edit");

  const [cards, setCards] = useState<ExploreCard[]>(initial);
  const [newHref, setNewHref] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [adding, setAdding] = useState(false);

  async function saveRow(row: ExploreCard): Promise<ExploreCard> {
    const res = await fetch(`/api/admin/home-explore/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        href: row.href,
        title: row.title,
        body: row.body,
        sectionLabel: row.sectionLabel?.trim() || null,
        visible: row.visible,
      }),
    });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as ExploreCard;
  }

  async function reorder(
    rows: ExploreCard[],
    from: number,
    to: number,
  ): Promise<ExploreCard[]> {
    const a = rows[from];
    const b = rows[to];
    const results = await Promise.all([
      fetch(`/api/admin/home-explore/${a.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/home-explore/${b.id}`, {
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

  async function del(row: ExploreCard): Promise<ExploreCard[]> {
    const res = await fetch(`/api/admin/home-explore/${row.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete failed — try again");
    return cards
      .filter((c) => c.id !== row.id)
      .map((c, idx) => ({ ...c, order: idx }));
  }

  async function add() {
    if (!newHref.trim() || !newTitle.trim() || !newBody.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/home-explore", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          href: newHref.trim(),
          title: newTitle.trim(),
          body: newBody.trim(),
          sectionLabel: newSectionLabel.trim() || undefined,
        }),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      const card = (await res.json()) as ExploreCard;
      setCards((prev) => [...prev, card]);
      setNewHref("");
      setNewTitle("");
      setNewBody("");
      setNewSectionLabel("");
      toast.success("Saved");
    } catch {
      toast.error("Save failed — try again");
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminSection id="cards" title="Explore Cards">
      <div className="mb-5 flex gap-3 rounded-xl border border-[color-mix(in_oklab,var(--gold)_20%,transparent)] bg-[color-mix(in_oklab,var(--gold)_7%,transparent)] px-4 py-3.5">
        <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
        <p className="text-xs leading-relaxed text-[var(--diq_mid)]">
          These link cards render in the Explore grid on the homepage. Hidden cards stay in
          this list but do not appear on{" "}
          <span className="font-mono text-[var(--gold)]">/#explore</span>. Changes go live
          after you save.
        </p>
      </div>

      <AdminEditableList<ExploreCard>
        rows={cards}
        onRowsChange={setCards}
        keyOf={(c) => c.id}
        canEdit={canEdit}
        canDelete={canDelete}
        canCreate={canCreate}
        itemNoun="card"
        addTitle="Add card"
        emptyText="No explore cards yet"
        emptyHint="Add your first card below — it'll show in the Explore grid on the homepage."
        emptyIcon={<LayoutGrid className="h-5 w-5" />}
        deleteConfirm="Delete this explore card?"
        onSave={saveRow}
        onReorder={reorder}
        onDelete={del}
        renderFields={(draft, setField, ctx) => (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
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
                  placeholder="About"
                  className={fieldBox}
                />
              </div>
              <div>
                <label className={fieldLabel}>Href</label>
                <input
                  value={draft.href}
                  disabled={ctx.disabled}
                  onChange={(e) => setField({ href: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      ctx.saveIfDirty();
                    } else if (e.key === "Escape") {
                      ctx.revert();
                    }
                  }}
                  placeholder="/about"
                  className={`${fieldBox} font-mono`}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Section label (optional)</label>
              <input
                value={draft.sectionLabel ?? ""}
                disabled={ctx.disabled}
                onChange={(e) => setField({ sectionLabel: e.target.value || null })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    ctx.saveIfDirty();
                  } else if (e.key === "Escape") {
                    ctx.revert();
                  }
                }}
                placeholder="About"
                className={fieldBox}
              />
            </div>
            <div>
              <label className={fieldLabel}>Body</label>
              <textarea
                value={draft.body}
                disabled={ctx.disabled}
                onChange={(e) => setField({ body: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Escape") ctx.revert();
                }}
                rows={2}
                placeholder="What DiQualia is…"
                className={`${fieldBox} resize-y`}
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={draft.visible}
                disabled={ctx.disabled}
                onChange={() => setField({ visible: !draft.visible })}
                className="accent-[var(--gold)]"
              />
              Visible on site
            </label>
          </div>
        )}
        addSlot={
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={fieldLabel}>Title</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="About"
                  className={fieldBox}
                />
              </div>
              <div>
                <label className={fieldLabel}>Href</label>
                <input
                  value={newHref}
                  onChange={(e) => setNewHref(e.target.value)}
                  placeholder="/about"
                  className={`${fieldBox} font-mono`}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Section label (optional)</label>
              <input
                value={newSectionLabel}
                onChange={(e) => setNewSectionLabel(e.target.value)}
                placeholder="About"
                className={fieldBox}
              />
            </div>
            <div>
              <label className={fieldLabel}>Body</label>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={2}
                placeholder="What DiQualia is…"
                className={`${fieldBox} resize-y`}
              />
            </div>
            <button
              type="button"
              onClick={add}
              disabled={adding || !newHref.trim() || !newTitle.trim() || !newBody.trim()}
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
