const LOCAL_DB_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isLocalDatabaseHost(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return LOCAL_DB_HOSTS.has(new URL(url).hostname.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Office / MitM proxies may replace TLS with a corporate root that Node does not trust.
 * Set DATABASE_SSL_REJECT_UNAUTHORIZED=0 only when you trust that network path.
 *
 * Note: `sslmode=require` (or similar) in the URL makes `pg` verify certs; that wins over
 * `ssl: { rejectUnauthorized: false }`. When opting out of verification, we strip `sslmode`
 * from the URL so the explicit `ssl` option applies.
 *
 * Local Postgres (127.0.0.1 / localhost) typically has no TLS — never force `ssl` there.
 */
export function pgSslOption():
  | undefined
  | { rejectUnauthorized: boolean } {
  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "0") {
    return undefined;
  }

  const url = process.env.DATABASE_URL ?? process.env.DIRECT_DATABASE_URL;
  if (isLocalDatabaseHost(url)) {
    return undefined;
  }

  return { rejectUnauthorized: false };
}

/** Connection string safe to pass to `pg` when using {@link pgSslOption}. */
export function pgConnectionString(url: string | undefined): string | undefined {
  if (!url) return url;

  const stripSslMode =
    isLocalDatabaseHost(url) ||
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "0";
  if (!stripSslMode) return url;

  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    const s = u.toString();
    return s.endsWith("?") ? s.slice(0, -1) : s;
  } catch {
    return url;
  }
}
