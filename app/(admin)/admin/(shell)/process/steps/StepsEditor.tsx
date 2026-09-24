"use client";

import { useState } from "react";
import { ListOrdered, Plus } from "lucide-react";
import { toast } from "sonner";

import { AdminEditableList, AdminSection } from "@/components/admin";
import { useCan } from "@/app/(admin)/admin/AdminSessionProvider";

import type { ProcessStepData } from "../types";

const fieldBox =
  "w-full rounded-lg border border-[var(--diq_border)] bg-[var(--diq_deep)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--diq_mid)] focus:border-[var(--gold)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--gold)_35%,transparent)] disabled:opacity-60";
const fieldLabel = "mb-1 block text-[11px] uppercase tracking-widest text-[var(--diq_mid)]";

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === "string") return body.error;
  } catch {
    /* fall through */
  }
  return "Save failed — try again";
}

export function StepsEditor({ initial }: { initial: ProcessStepData[] }) {
  const canCreate = useCan("content.create");
  const canDelete = useCan("content.delete");
  const canEdit = useCan("content.edit");

  const [steps, setSteps] = useState<ProcessStepData[]>(initial);
  const [newLabel, setNewLabel] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [adding, setAdding] = useState(false);

  async function saveRow(row: ProcessStepData): Promise<ProcessStepData> {
    const res = await fetch(`/api/admin/process-steps/${row.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepLabel: row.stepLabel,
        stepNumber: row.stepNumber,
        title: row.title,
        body: row.body,
      }),
    });
    if (!res.ok) throw new Error(await readError(res));
    return (await res.json()) as ProcessStepData;
  }

  async function reorder(
    rows: ProcessStepData[],
    from: number,
    to: number,
  ): Promise<ProcessStepData[]> {
    const a = rows[from];
    const b = rows[to];
    const results = await Promise.all([
      fetch(`/api/admin/process-steps/${a.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/process-steps/${b.id}`, {
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

  async function del(row: ProcessStepData): Promise<ProcessStepData[]> {
    const res = await fetch(`/api/admin/process-steps/${row.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Delete failed — try again");
    // Server re-packs `order` to array position; mirror that locally.
    return steps
      .filter((s) => s.id !== row.id)
      .map((s, idx) => ({ ...s, order: idx }));
  }

  async function add() {
    if (!newLabel.trim() || !newNumber.trim() || !newTitle.trim() || !newBody.trim() || adding) {
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/process-steps", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepLabel: newLabel.trim(),
          stepNumber: newNumber.trim(),
          title: newTitle.trim(),
          body: newBody.trim(),
        }),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      const step = (await res.json()) as ProcessStepData;
      setSteps((prev) => [...prev, step]);
      setNewLabel("");
      setNewNumber("");
      setNewTitle("");
      setNewBody("");
      toast.success("Saved");
    } catch {
      toast.error("Save failed — try again");
    } finally {
      setAdding(false);
    }
  }

  return (
    <AdminSection title="Process Steps">
      <AdminEditableList<ProcessStepData>
        rows={steps}
        onRowsChange={setSteps}
        keyOf={(s) => s.id}
        canEdit={canEdit}
        canDelete={canDelete}
        canCreate={canCreate}
        itemNoun="step"
        addTitle="Add step"
        emptyText="No process steps yet"
        emptyHint="Add your first step below — steps appear on the homepage and /process in order."
        emptyIcon={<ListOrdered className="h-5 w-5" />}
        deleteConfirm="Delete this step?"
        onSave={saveRow}
        onReorder={reorder}
        onDelete={del}
        renderFields={(draft, setField, ctx) => {
          const onKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ctx.saveIfDirty();
            } else if (e.key === "Escape") {
              ctx.revert();
            }
          };
          return (
            <div className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Step label</label>
                  <input
                    value={draft.stepLabel}
                    disabled={ctx.disabled}
                    onChange={(e) => setField({ stepLabel: e.target.value })}
                    onKeyDown={onKeyDown}
                    placeholder="Step One"
                    className={fieldBox}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Step number</label>
                  <input
                    value={draft.stepNumber}
                    disabled={ctx.disabled}
                    onChange={(e) => setField({ stepNumber: e.target.value })}
                    onKeyDown={onKeyDown}
                    placeholder="01"
                    className={fieldBox}
                  />
                </div>
              </div>
              <div>
                <label className={fieldLabel}>Title</label>
                <input
                  value={draft.title}
                  disabled={ctx.disabled}
                  onChange={(e) => setField({ title: e.target.value })}
                  onKeyDown={onKeyDown}
                  placeholder="Step title"
                  className={fieldBox}
                />
              </div>
              <div>
                <label className={fieldLabel}>Body</label>
                <textarea
                  value={draft.body}
                  disabled={ctx.disabled}
                  onChange={(e) => setField({ body: e.target.value })}
                  onKeyDown={onKeyDown}
                  rows={3}
                  placeholder="Step description…"
                  className={`${fieldBox} resize-y`}
                />
              </div>
            </div>
          );
        }}
        addSlot={
          <div className="space-y-2.5">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Step label — Step Six"
                className={fieldBox}
              />
              <input
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Step number — 06"
                className={fieldBox}
              />
            </div>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New step title"
              className={fieldBox}
            />
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Step description…"
              rows={2}
              className={`${fieldBox} resize-y`}
            />
            <button
              type="button"
              onClick={add}
              disabled={
                adding ||
                !newLabel.trim() ||
                !newNumber.trim() ||
                !newTitle.trim() ||
                !newBody.trim()
              }
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-pill bg-[var(--gold)] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--diq_ink)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[var(--gold-lt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {adding ? "Adding" : "Add step"}
            </button>
          </div>
        }
      />
    </AdminSection>
  );
}
