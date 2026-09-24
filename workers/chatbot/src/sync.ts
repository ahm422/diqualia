/**
 * Automatic knowledge-base sync.
 *
 * D1 triggers (migration 0011) append a row to kb_sync_outbox on every
 * INSERT / UPDATE / DELETE of a public CMS table. The cron trigger calls
 * KbSync every minute; when the outbox has rows it re-runs the incremental
 * ingestion and then clears the rows it covered. Changes that land while a
 * sync is running keep their outbox rows and are picked up next minute.
 *
 * KbSync is a single named instance so two cron ticks (or a manual /sync)
 * never index concurrently.
 */

import { DurableObject } from "cloudflare:workers";

import { runIngestion, type IngestResult } from "./rag/ingest";

export type SyncOutcome =
  | { status: "skipped"; reason: string }
  | { status: "done"; pending: number; result: IngestResult };

export class KbSync extends DurableObject<Env> {
  private running: Promise<SyncOutcome> | null = null;

  /**
   * @param force  re-embed every document, ignoring content hashes
   * @param always run even when the outbox is empty (periodic reconcile)
   */
  async sync(opts: { force?: boolean; always?: boolean } = {}): Promise<SyncOutcome> {
    if (this.running) return { status: "skipped", reason: "already running" };
    this.running = this.run(opts).finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async run(opts: { force?: boolean; always?: boolean }): Promise<SyncOutcome> {
    const db = this.env.DB;
    const row = await db
      .prepare(`SELECT MAX(id) AS maxId, COUNT(*) AS pending FROM kb_sync_outbox`)
      .first<{ maxId: number | null; pending: number }>();
    const maxId = row?.maxId ?? null;
    const pending = row?.pending ?? 0;
    if (maxId === null && !opts.always && !opts.force) {
      return { status: "skipped", reason: "no pending changes" };
    }

    const result = await runIngestion(this.env, { force: opts.force });
    // Only clear the outbox when every document indexed cleanly, so a failed
    // embed/upsert is retried on the next tick.
    if (maxId !== null && result.errors.length === 0) {
      await db.prepare(`DELETE FROM kb_sync_outbox WHERE id <= ?`).bind(maxId).run();
    }
    console.log(JSON.stringify({ req: "kb_sync", pending, ...result }));
    return { status: "done", pending, result };
  }
}
