/**
 * Capture blog cover + in-body image QA shots (Phase 7 — blog image presentation).
 * Usage (dev server already running): QA_BASE=http://127.0.0.1:3000 npx tsx scripts/qa-blog-image-shots.ts before
 *   pass "before" or "after" as argv[2] — it suffixes every file.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.QA_BASE ?? "http://127.0.0.1:3000";
const slug = process.env.QA_SLUG ?? "testing-blog";
const phase = process.argv[2] === "after" ? "after" : "before";
const outDir = path.join(process.cwd(), "docs/qa/blog-image");

const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "375", width: 375, height: 812 },
];
const themes = [
  { name: "light", dark: false },
  { name: "dark", dark: true },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const vp of viewports) {
    for (const theme of themes) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle" });
      await page.evaluate((dark) => {
        localStorage.setItem("diqualia-theme", dark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", dark);
        window.dispatchEvent(new Event("diqualia-theme-change"));
      }, theme.dark);
      await page.waitForTimeout(200);
      const file = `post-${vp.name}-${theme.name}-${phase}.png`;
      await page.screenshot({ path: path.join(outDir, file), fullPage: true });
      console.log("wrote", file);
    }
  }

  // Blog index — featured card at mobile width.
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/blog`, { waitUntil: "networkidle" });
  const file = `index-375-light-${phase}.png`;
  await page.screenshot({ path: path.join(outDir, file), fullPage: true });
  console.log("wrote", file);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
