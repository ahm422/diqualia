/**
 * Custom Worker entry point.
 *
 * @opennextjs/cloudflare's build output (`.open-next/worker.js`) only
 * exports a `fetch` handler — there's no hook for adding a Cron Trigger's
 * `scheduled()` handler. This file wraps that build output, re-exporting
 * its `fetch` unchanged and adding `scheduled()` for the stale
 * career-application-draft cleanup job (issue #102). `wrangler.jsonc`
 * points `main` here instead of directly at `.open-next/worker.js`.
 *
 * Local test: `npx wrangler dev --test-scheduled`, then in another
 * terminal: `curl "http://localhost:8787/__scheduled?cron=0+3+*+*+*"`.
 */
import { default as handler } from "../../.open-next/worker.js";

import { cleanupStaleDrafts } from "../../lib/careers/cleanup-drafts";
import { createPrismaClient } from "../../lib/prisma-core";

const worker = {
  fetch: handler.fetch,

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    switch (controller.cron) {
      case "0 3 * * *":
        ctx.waitUntil(runDraftCleanup(env));
        break;
      default:
        console.warn(`[scheduled] no handler for cron expression: ${controller.cron}`);
    }
  },
};

export default worker;

async function runDraftCleanup(env: Env): Promise<void> {
  if (!env.R2) {
    console.error("[cleanupStaleDrafts] R2 binding unavailable; skipping run");
    return;
  }
  const prisma = createPrismaClient(env.DB);
  const bucket = env.R2;
  const summary = await cleanupStaleDrafts(prisma, {
    deleteObject: async ({ key }) => {
      await bucket.delete(key);
    },
  });
  console.log("[cleanupStaleDrafts] summary", summary);
  if (summary.errors.length > 0) {
    console.error("[cleanupStaleDrafts] per-draft errors", summary.errors);
  }
}
