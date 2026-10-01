/**
 * Fire ONE transactional email to a real inbox via the Cloudflare Email Sending
 * REST API. Setup / deliverability check only.
 *
 * The Workers `send_email` binding (env.EMAIL) is NOT available to plain Node /
 * `getPlatformProxy`, so this uses the REST endpoint with an API token instead.
 * The live app still sends through the binding (lib/email.ts).
 *
 * DANGER: sends real mail. Requires `diqualia.com` onboarded for Email Sending
 * (SPF/DKIM/DMARC verified). Remove or lock this script
 * (and the `email:test` npm script) before shipping.
 *
 * Env (via .env / .dev.vars / shell):
 *   CLOUDFLARE_API_TOKEN   required — token with the "Send email" permission
 *   CLOUDFLARE_ACCOUNT_ID  optional — falls back to wrangler.jsonc account_id
 *
 *   npm run email:test -- --to you@example.com
 */
import "dotenv/config";
import { readFileSync } from "node:fs";

import { EMAIL_FROM } from "../lib/email-shared";

function readToFlag(argv: string[]): string {
  const idx = argv.indexOf("--to");
  const value = idx === -1 ? "" : (argv[idx + 1] ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    throw new Error("--to requires a valid email address");
  }
  return value;
}

function accountId(): string {
  const fromEnv = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (fromEnv) return fromEnv;
  const cfg = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  const match = cfg.match(/"account_id"\s*:\s*"([0-9a-f]+)"/i);
  if (!match) throw new Error("CLOUDFLARE_ACCOUNT_ID not set and not found in wrangler.jsonc");
  return match[1];
}

async function main() {
  const to = readToFlag(process.argv.slice(2));
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN is required (token with 'Send email' permission)");

  const stamp = new Date().toISOString();
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId()}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        from: { address: EMAIL_FROM.email, name: EMAIL_FROM.name },
        subject: `DiQualia email test — ${stamp}`,
        text: `Plain-text test message sent ${stamp} via the Cloudflare Email Sending REST API.`,
        html: `<p>HTML test message sent <code>${stamp}</code> via the Cloudflare Email Sending REST API.</p>`,
      }),
    },
  );

  const body = (await res.json()) as {
    success?: boolean;
    errors?: Array<{ code: number; message: string }>;
    result?: { delivered?: string[]; queued?: string[]; permanent_bounces?: string[] } | null;
  };

  if (!res.ok || !body.success) {
    console.error(`send failed (HTTP ${res.status}):`, JSON.stringify(body.errors ?? body, null, 2));
    process.exit(1);
  }
  console.error(`sent to ${to} —`, JSON.stringify(body.result));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
