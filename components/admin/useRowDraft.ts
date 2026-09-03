"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type RowKey = string | number;

export type UseRowDraftArgs<Row> = {
  /** Server-truth rows. The hook keeps its own copy and calls `onRowsChange` when it changes. */
  rows: Row[];
  onRowsChange: (rows: Row[]) => void;
  keyOf: (row: Row) => RowKey;
  /** Persist a single edited row. MUST throw on failure; the thrown message is toasted. */
  onSave: (row: Row) => Promise<Row>;
  /** Persist a reorder and return the new canonical order. Omit to hide the ↑/↓ controls. */
  onReorder?: (rows: Row[], from: number, to: number) => Promise<Row[]>;
  /** Persist a delete. Return the new array, or `void` to just drop the row locally. */
  onDelete?: (row: Row) => Promise<Row[] | void>;
};

function shallowEqual<Row>(a: Row, b: Row): boolean {
  if (Object.is(a, b)) return true;
  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;
  return ak.every((k) =>
    Object.is(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
    ),
  );
}

function messageOf(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return "Save failed — try again";
}

/**
 * Headless "editable list row" primitive: per-row local draft, dirty detection,
 * explicit save with toast, plus immediate reorder / delete actions. UI-agnostic
 * so richer editors (collapsible panels, multi-field rows) can reuse it.
 */
export function useRowDraft<Row>({
  rows: serverRows,
  onRowsChange,
  keyOf,
  onSave,
  onReorder,
  onDelete,
}: UseRowDraftArgs<Row>) {
  const [drafts, setDrafts] = useState<Map<RowKey, Row>>(new Map());
  const [savingKeys, setSavingKeys] = useState<Set<RowKey>>(new Set());
  const [busy, setBusy] = useState(false);

  // Keep the latest server rows available to callbacks without re-creating them.
  const rowsRef = useRef(serverRows);
  rowsRef.current = serverRows;

  // Drop drafts whose row no longer exists (e.g. deleted elsewhere).
  useEffect(() => {
    setDrafts((prev) => {
      if (prev.size === 0) return prev;
      const liveKeys = new Set(serverRows.map(keyOf));
      let changed = false;
      const next = new Map(prev);
      for (const k of next.keys()) {
        if (!liveKeys.has(k)) {
          next.delete(k);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [serverRows, keyOf]);

  const rowByKey = useMemo(() => {
    const m = new Map<RowKey, Row>();
    for (const r of serverRows) m.set(keyOf(r), r);
    return m;
  }, [serverRows, keyOf]);

  const draftFor = useCallback(
    (key: RowKey): Row => drafts.get(key) ?? rowByKey.get(key)!,
    [drafts, rowByKey],
  );

  const isDirty = useCallback(
    (key: RowKey): boolean => {
      const draft = drafts.get(key);
      const row = rowByKey.get(key);
      if (!draft || !row) return false;
      return !shallowEqual(draft, row);
    },
    [drafts, rowByKey],
  );

  const dirtyKeys = useMemo(
    () => [...drafts.keys()].filter((k) => isDirty(k)),
    [drafts, isDirty],
  );

  const setField = useCallback(
    (key: RowKey, patch: Partial<Row>) => {
      setDrafts((prev) => {
        const base = prev.get(key) ?? rowByKey.get(key);
        if (!base) return prev;
        const next = new Map(prev);
        next.set(key, { ...base, ...patch });
        return next;
      });
    },
    [rowByKey],
  );

  const revert = useCallback((key: RowKey) => {
    setDrafts((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const save = useCallback(
    async (key: RowKey) => {
      if (!isDirty(key) || savingKeys.has(key)) return;
      const draft = drafts.get(key)!;
      setSavingKeys((prev) => new Set(prev).add(key));
      try {
        const saved = await onSave(draft);
        onRowsChange(rowsRef.current.map((r) => (keyOf(r) === key ? saved : r)));
        revert(key);
        toast.success("Saved");
      } catch (err) {
        toast.error(messageOf(err));
      } finally {
        setSavingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [drafts, isDirty, keyOf, onRowsChange, onSave, revert, savingKeys],
  );

  const move = useCallback(
    async (key: RowKey, dir: -1 | 1) => {
      if (!onReorder || busy) return;
      const current = rowsRef.current;
      const from = current.findIndex((r) => keyOf(r) === key);
      const to = from + dir;
      if (from < 0 || to < 0 || to >= current.length) return;
      setBusy(true);
      try {
        onRowsChange(await onReorder(current, from, to));
      } catch (err) {
        toast.error(messageOf(err));
      } finally {
        setBusy(false);
      }
    },
    [busy, keyOf, onReorder, onRowsChange],
  );

  const remove = useCallback(
    async (key: RowKey) => {
      if (!onDelete || busy) return;
      const row = rowsRef.current.find((r) => keyOf(r) === key);
      if (!row) return;
      setBusy(true);
      try {
        const next = await onDelete(row);
        onRowsChange(next ?? rowsRef.current.filter((r) => keyOf(r) !== key));
        revert(key);
      } catch (err) {
        toast.error(messageOf(err));
      } finally {
        setBusy(false);
      }
    },
    [busy, keyOf, onDelete, onRowsChange, revert],
  );

  const saving = useCallback((key: RowKey) => savingKeys.has(key), [savingKeys]);

  return {
    rows: serverRows,
    dirtyKeys,
    draftFor,
    isDirty,
    setField,
    save,
    revert,
    remove,
    move,
    saving,
    busy,
    canReorder: Boolean(onReorder),
    canDelete: Boolean(onDelete),
  };
}
