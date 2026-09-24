/**
 * ChatSession — one Durable Object per visitor session (keyed by the session
 * id cookie the website sets). Stores the conversation in SQLite so every
 * turn is answered with the previous messages of the same session, and the
 * widget can restore the conversation after a page reload.
 *
 * History expires after CHAT.sessionTtlMs of inactivity (alarm).
 */

import { DurableObject } from "cloudflare:workers";

import type { ChatTurn } from "./ai";
import { CHAT } from "./config";

export class ChatSession extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => this.ensureSchema());
  }

  private ensureSchema() {
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content    TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  /** Most recent `limit` messages, oldest first. */
  history(limit: number = CHAT.historyWindow): ChatTurn[] {
    return this.ctx.storage.sql
      .exec<{ role: "user" | "assistant"; content: string }>(
        `SELECT role, content FROM (
           SELECT id, role, content FROM messages ORDER BY id DESC LIMIT ?
         ) ORDER BY id ASC`,
        limit,
      )
      .toArray()
      .map((r) => ({ role: r.role, content: r.content }));
  }

  /** Appends turns, trims to the stored cap, and extends the expiry. */
  async append(turns: ChatTurn[]): Promise<void> {
    const now = Date.now();
    for (const t of turns) {
      this.ctx.storage.sql.exec(
        `INSERT INTO messages (role, content, created_at) VALUES (?, ?, ?)`,
        t.role,
        t.content,
        now,
      );
    }
    this.ctx.storage.sql.exec(
      `DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY id DESC LIMIT ?)`,
      CHAT.historyStored,
    );
    await this.ctx.storage.setAlarm(now + CHAT.sessionTtlMs);
  }

  async clear(): Promise<void> {
    await this.ctx.storage.deleteAll();
    this.ensureSchema();
  }

  async alarm(): Promise<void> {
    await this.clear();
  }
}
