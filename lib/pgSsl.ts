/**
 * Office / MitM proxies may replace TLS with a corporate root that Node does not trust.
 * Set DATABASE_SSL_REJECT_UNAUTHORIZED=0 only when you trust that network path.
 *
 * Note: `sslmode=require` (or similar) in the URL makes `pg` verify certs; that wins over
 * `ssl: { rejectUnauthorized: false }`. When opting out of verification, we strip `sslmode`
 * from the URL so the explicit `ssl` option applies.
 */
export function pgSslOption():
  | undefined
  | { rejectUnauthorized: boolean } {
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "0") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

/** Connection string safe to pass to `pg` when using {@link pgSslOption}. */
export function pgConnectionString(url: string | undefined): string | undefined {
  if (!url) return url;
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "0") return url;
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    const s = u.toString();
    return s.endsWith("?") ? s.slice(0, -1) : s;
  } catch {
    return url;
  }
}
