import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type E2eResponse = {
  status: number;
  headers: Headers;
  text: string;
  json: unknown;
  url: string;
};

export class CookieJar {
  private cookies = new Map<string, string>();

  ingest(response: Response) {
    const setCookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [];
    for (const raw of setCookies) {
      const [pair] = raw.split(";");
      const eq = pair.indexOf("=");
      if (eq === -1) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (!value) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  header(): string | undefined {
    if (this.cookies.size === 0) return undefined;
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  get(name: string): string | undefined {
    return this.cookies.get(name);
  }

  clear() {
    this.cookies.clear();
  }
}

let step = 0;

export function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

export function logOk(msg: string) {
  console.log(`  ✓ ${msg}`);
}

export class E2eFail extends Error {
  constructor(message: string) {
    super(message);
    this.name = "E2eFail";
  }
}

export function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) fail(msg);
}

export function fail(msg: string): never {
  console.error(`\n✗ FAIL [step ${step}]: ${msg}`);
  throw new E2eFail(msg);
}

export function stepLabel(label: string) {
  step += 1;
  return label;
}

export function createClient(base: string, jar: CookieJar) {
  async function request(path: string, init: RequestInit = {}): Promise<E2eResponse> {
    const headers = new Headers(init.headers);
    const cookie = jar.header();
    if (cookie) headers.set("cookie", cookie);

    const res = await fetch(`${base}${path}`, { ...init, headers, redirect: "manual" });
    jar.ingest(res);
    const text = await res.text();
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* not json */
    }
    return { status: res.status, headers: res.headers, text, json, url: res.url };
  }

  return { request };
}

export const PNG_1X1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export function pngBlob(): Blob {
  const buf = Buffer.from(PNG_1X1_BASE64, "base64");
  return new Blob([buf], { type: "image/png" });
}

export function d1Query(sql: string): unknown[] {
  try {
    const out = execSync(
      `npx wrangler d1 execute diqualia-db --local --command ${JSON.stringify(sql)} --json`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
    const parsed = JSON.parse(out) as { results?: Record<string, unknown>[] }[];
    const rows: unknown[] = [];
    for (const batch of parsed) {
      for (const row of batch.results ?? []) rows.push(row);
    }
    return rows;
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    throw new Error(`D1 query failed: ${e.stderr ?? e.stdout ?? String(err)}`);
  }
}

export function d1JsonColumn(sql: string, column: string): unknown {
  const rows = d1Query(sql) as Record<string, unknown>[];
  const raw = rows[0]?.[column];
  if (raw == null) throw new Error(`D1 column ${column} missing`);
  if (typeof raw === "string") return JSON.parse(raw);
  return raw;
}

export function r2ObjectExists(key: string): boolean {
  const dir = mkdtempSync(join(tmpdir(), "e2e-r2-"));
  const file = join(dir, "obj.bin");
  try {
    execSync(
      `npx wrangler r2 object get diqualia-assets/${key} --local --file ${JSON.stringify(file)}`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
    );
    return true;
  } catch {
    return false;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

function refuseBase(base: string, detail: string): never {
  console.error(`✗ Refusing --base ${base}: ${detail}`);
  console.error(
    "This suite mutates the D1 bound to --base via admin PATCH/POST. It must never be pointed at a shared, preview, workers.dev, or production database.",
  );
  console.error(
    "Allowed target: local npm run preview / npm run cf:preview on 127.0.0.1, localhost, or [::1] only.",
  );
  process.exit(1);
}

export function parseArgs(argv: string[]) {
  let base = "http://127.0.0.1:8787";

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base" && argv[i + 1]) {
      base = argv[++i];
    }
  }

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    refuseBase(base, "not a valid URL");
  }

  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    refuseBase(base, `hostname "${url.hostname}" is not loopback (shared/preview/prod D1 risk)`);
  }

  return { base };
}
