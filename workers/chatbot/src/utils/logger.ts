/**
 * Lightweight observability for the RAG pipeline.
 *
 * Collects per-request timing + counters and writes a single structured log
 * line server-side. Never logs secrets, credentials, API keys, or full user
 * message content unnecessarily.
 */

export type RagTimings = Record<string, number>;

export class RagLogger {
  readonly requestId: string;
  private readonly timings: RagTimings = {};
  private readonly counters: Record<string, number> = {};
  private readonly startedAt = Date.now();
  private readonly marks: { name: string; at: number }[] = [];
  private lastMarkAt = Date.now();

  constructor(requestId: string) {
    this.requestId = requestId;
    this.mark("start");
  }

  mark(name: string) {
    const now = Date.now();
    const fromLast = now - this.lastMarkAt;
    this.marks.push({ name, at: now });
    this.timings[`${name}_ms`] = fromLast;
    this.lastMarkAt = now;
  }

  count(name: string, n = 1) {
    this.counters[name] = (this.counters[name] ?? 0) + n;
  }

  /** Writes a safe summary log line (dev and prod). Redact anything sensitive. */
  flush(extra?: Record<string, string | number>) {
    const totalMs = Date.now() - this.startedAt;
    console.log(
      JSON.stringify({
        req: "rag",
        requestId: this.requestId,
        totalMs,
        timings: this.timings,
        counters: this.counters,
        ...(extra ?? {}),
      }),
    );
  }
}
