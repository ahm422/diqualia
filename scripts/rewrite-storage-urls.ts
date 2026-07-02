/**
 * One-time URL rewrite for Phase 9.5 storage cutover (Garage → R2).
 * Do not run against production until after rclone bulk copy completes.
 *
 * Usage:
 *   OLD_PUBLIC_URL=https://garage.example.com/diqualia-assets \
 *   NEW_PUBLIC_URL=https://pub-xxxx.r2.dev \
 *   tsx scripts/rewrite-storage-urls.ts --local
 *
 *   OLD_PUBLIC_URL=... NEW_PUBLIC_URL=... tsx scripts/rewrite-storage-urls.ts --remote
 */
import "dotenv/config";

import { withD1Client } from "./lib/d1-proxy";

function requirePublicUrl(name: "OLD_PUBLIC_URL" | "NEW_PUBLIC_URL"): string {
  const value = process.env[name]?.trim().replace(/\/$/, "");
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const target = process.argv.includes("--remote") ? "remote" : "local";
  const oldPublicUrl = requirePublicUrl("OLD_PUBLIC_URL");
  const newPublicUrl = requirePublicUrl("NEW_PUBLIC_URL");

  let updated = 0;

  await withD1Client(target, async (prisma) => {
    const rows = await prisma.siteSettings.findMany({
      where: {
        logoUrl: { startsWith: oldPublicUrl },
      },
      select: { id: true, logoUrl: true },
    });

    for (const row of rows) {
      if (!row.logoUrl) continue;
      const logoUrl = row.logoUrl.replace(oldPublicUrl, newPublicUrl);
      await prisma.siteSettings.update({
        where: { id: row.id },
        data: { logoUrl },
      });
      updated += 1;
    }
  });

  console.error(`Updated ${updated} SiteSettings.logoUrl row(s) (${target} D1).`);
  console.error(`  OLD_PUBLIC_URL: ${oldPublicUrl}`);
  console.error(`  NEW_PUBLIC_URL: ${newPublicUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
