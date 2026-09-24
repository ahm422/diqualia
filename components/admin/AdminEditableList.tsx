"use client";

import type { ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Inbox,
  Loader,
  Plus,
  Trash2,
} from "lucide-react";

import { useRowDraft } from "./useRowDraft";

type RowKey = string | number;

export type EditableRowContext = {
  /** Whether the fields should be rendered read-only (no edit capability). */
  disabled: boolean;
  /** True while this row has unsaved edits. */
  dirty: boolean;
  /** Save the row if it has unsaved changes (wire to Enter). */
  saveIfDirty: () => void;
  /** Discard this row's unsaved changes (wire to Escape). */
  revert: () => void;
};

export type AdminEditableListProps<Row> = {
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
  keyOf: (row: Row) => RowKey;
  renderFields: (
    draft: Row,
    setField: (patch: Partial<Row>) => void,
    ctx: EditableRowContext,
  ) => ReactNode;
  onSave: (row: Row) => Promise<Row>;
  onReorder?: (rows: Row[], from: number, to: number) => Promise<Row[]>;
  onDelete?: (row: Row) => Promise<Row[] | void>;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  /** Singular noun for microcopy — "3 items", "Delete this item?", "Add item". */
  itemNoun?: string;
  emptyText: string;
  emptyHint?: string;
  emptyIcon?: ReactNode;
  deleteConfirm?: string;
  addTitle?: string;
  /** Caller-supplied "add row" form, shown below the list when `canCreate`. */
  addSlot?: ReactNode;
};

const stepBtn =
  "grid h-7 w-8 place-items-center text-[var(--diq_mid)] transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] hover:text-[var(--gold)] focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[var(--gold)] disabled:pointer-events-none disabled:opacity-25";

export function AdminEditableList<Row>({
  rows,
  onRowsChange,
  keyOf,
  renderFields,
  onSave,
  onReorder,
  onDelete,
  canEdit,
  canDelete,
  canCreate,
  itemNoun = "item",
  emptyText,
  emptyHint,
  emptyIcon,
  deleteConfirm,
  addTitle,
  addSlot,
}: AdminEditableListProps<Row>) {
  const draft = useRowDraft<Row>({
    rows,
    onRowsChange,
    keyOf,
    onSave,
    onReorder: canEdit ? onReorder : undefined,
    onDelete: canDelete ? onDelete : undefined,
  });

  const otherRowDirty = (key: RowKey) => draft.dirtyKeys.some((k) => k !== key);
  const confirmDiscardOthers = (key: RowKey) =>
    !otherRowDirty(key) || window.confirm("Discard unsaved changes in another row?");

  const deletePrompt = deleteConfirm ?? `Delete this ${itemNoun}?`;
  const showActions = canEdit || canDelete;

  return (
    <div>
      {rows.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--diq_mid)]">
            {rows.length} {itemNoun}
            {rows.length === 1 ? "" : "s"}
          </span>
          {draft.dirtyKeys.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--gold)_40%,transparent)] bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] motion-safe:animate-pulse" />
              {draft.dirtyKeys.length} unsaved
            </span>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--diq_border)] bg-[var(--diq_panel)] px-6 py-14 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] bg-[color-mix(in_oklab,var(--gold)_12%,transparent)] text-[var(--gold)]">
            {emptyIcon ?? <Inbox className="h-6 w-6" />}
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">{emptyText}</p>
          {emptyHint && (
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[var(--diq_mid)]">
              {emptyHint}
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row, idx) => {
            const key = keyOf(row);
            const dirty = draft.isDirty(key);
            const saving = draft.saving(key);
            const ctx: EditableRowContext = {
              disabled: !canEdit,
              dirty,
              saveIfDirty: () => draft.save(key),
              revert: () => draft.revert(key),
            };
            return (
              <li
                key={key}
                className={[
                  "rounded-xl border transition-[border-color,background-color,box-shadow] duration-200",
                  dirty
                    ? "border-[color-mix(in_oklab,var(--gold)_38%,transparent)] bg-[color-mix(in_oklab,var(--gold)_9%,var(--diq_panel))] shadow-[inset_3px_0_0_var(--gold)]"
                    : "border-[var(--diq_border)] bg-[var(--diq_panel)] shadow-[0_1px_2px_color-mix(in_oklab,var(--ink)_12%,transparent)] hover:border-[color-mix(in_oklab,var(--gold)_30%,transparent)]",
                ].join(" ")}
              >
                <div className="flex items-start gap-3 p-3.5 sm:gap-4 sm:p-4">
                  {/* order rail */}
                  <div className="shrink-0 pt-0.5">
                    {draft.canReorder ? (
                      <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--diq_border)] bg-[var(--diq_surface)]">
                        <button
                          type="button"
                          onClick={() => draft.move(key, -1)}
                          disabled={idx === 0 || draft.busy}
                          className={stepBtn}
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="grid h-6 w-8 place-items-center border-y border-[var(--diq_border)] font-mono text-[10px] tabular-nums text-[var(--diq_mid)]">
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => draft.move(key, 1)}
                          disabled={idx === rows.length - 1 || draft.busy}
                          className={stepBtn}
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center gap-0.5 rounded-lg border border-[var(--diq_border)] bg-[var(--diq_surface)] font-mono text-[10px] tabular-nums text-[var(--diq_mid)]">
                        <GripVertical className="h-3 w-3 opacity-50" />
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* body */}
                  <div className="min-w-0 flex-1">
                    {renderFields(
                      draft.draftFor(key),
                      (patch) => draft.setField(key, patch),
                      ctx,
                    )}
                    {dirty && (
                      <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px]">
                        <span className="inline-flex items-center gap-1.5 font-medium text-[var(--gold)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] motion-safe:animate-pulse" />
                          Unsaved changes
                        </span>
                        <span className="text-[var(--diq_mid)]">Enter to save · Esc to undo</span>
                      </p>
                    )}
                  </div>

                  {/* actions */}
                  {showActions && (
                    <div className="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch">
                      {canDelete && draft.canDelete ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirmDiscardOthers(key)) return;
                            if (!window.confirm(deletePrompt)) return;
                            draft.remove(key);
                          }}
                          disabled={draft.busy}
                          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--diq_mid)] transition-colors hover:bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)] hover:text-[var(--destructive)] focus-visible:outline-2 focus-visible:outline-[var(--gold)] disabled:pointer-events-none disabled:opacity-30"
                          aria-label={deletePrompt}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span />
                      )}
                      {canEdit &&
                        (dirty || saving ? (
                          <button
                            type="button"
                            onClick={() => draft.save(key)}
                            disabled={saving}
                            className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-[var(--gold)] px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--diq_ink)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[var(--gold-lt)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)] active:translate-y-px disabled:opacity-70"
                          >
                            {saving && <Loader className="h-3.5 w-3.5 animate-spin" />}
                            {saving ? "Saving" : "Save"}
                          </button>
                        ) : (
                          <span className="inline-flex h-8 items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[color-mix(in_oklab,var(--diq_mid)_75%,transparent)]">
                            <Check className="h-3.5 w-3.5" />
                            Saved
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canCreate && addSlot && (
        <div className="mt-4 rounded-xl border border-[color-mix(in_oklab,var(--gold)_24%,transparent)] bg-[color-mix(in_oklab,var(--gold)_5%,transparent)] p-4 sm:p-5">
          <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--diq_mid)]">
            <Plus className="h-3.5 w-3.5 text-[var(--gold)]" />
            {addTitle ?? `Add ${itemNoun}`}
          </p>
          {addSlot}
        </div>
      )}
    </div>
  );
}
