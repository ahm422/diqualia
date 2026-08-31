/**
 * Fire ONE transactional email through the Cloudflare `send_email` (EMAIL)
 * binding to a real inbox. Setup / deliverability check only.
 *
 * DANGER: sends real mail. Requires `diqualia.com` onboarded for Email Sending
 * (SPF/DKIM/DMARC verified) — see docs/DEPLOY-108.md. Remove or lock this script
 * (and the `email:test` npm script) before shipping.
 *
 *   npx tsx scripts/send-test-email.ts --to you@example.com           # local binding
 *   npx tsx scripts/send-test-email.ts --to you@example.com --remote  # remote binding
 */
import "dotenv/config";
import { getPlatformProxy } from "wrangler";

import { EMAIL_FROM } from "../lib/email-shared";

function readToFlag(argv: string[]): string {
  const idx = argv.indexOf("--to");
  const value = idx === -1 ? "" : (argv[idx + 1] ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
    throw new Error("--to requires a valid email address");
  }
  return value;
}

async function main() {
  const argv = process.argv.slice(2);
  const remote = argv.includes("--remote");
  const to = readToFlag(argv);

  const { env, dispose } = await getPlatformProxy<Env>(
    remote
      ? { remoteBindings: true, environment: "remote" }
      : { persist: true, remoteBindings: false },
  );

  try {
    if (!env.EMAIL) {
      console.error("EMAIL binding unavailable from getPlatformProxy; aborting.");
      process.exit(1);
    }
    const stamp = new Date().toISOString();
    const { messageId } = await env.EMAIL.send({
      from: EMAIL_FROM,
      to,
      subject: `DiQualia email test — ${stamp}`,
      text: `Plain-text test message sent ${stamp} via the Cloudflare send_email binding.`,
      html: `<p>HTML test message sent <code>${stamp}</code> via the Cloudflare send_email binding.</p>`,
    });
    console.error(`sent to ${to} (${remote ? "remote" : "local"}) messageId=${messageId}`);
  } finally {
    await dispose();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
