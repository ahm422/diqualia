/**
 * Recapture public apply-form QA shots against local preview.
 * Usage (preview already running): npx tsx scripts/qa-career-apply-shots.ts
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = process.env.QA_BASE ?? "http://127.0.0.1:8787";
const outDir = path.join(process.cwd(), "docs/qa/career-apply-pii");

const shots: { file: string; width: number; height: number; dark: boolean; openSelect: boolean }[] = [
  { file: "apply-375-light.png", width: 375, height: 812, dark: false, openSelect: false },
  { file: "apply-375-dark.png", width: 375, height: 812, dark: true, openSelect: true },
  { file: "apply-768-light.png", width: 768, height: 1024, dark: false, openSelect: false },
  { file: "apply-768-dark.png", width: 768, height: 1024, dark: true, openSelect: false },
  { file: "apply-1440-light.png", width: 1440, height: 900, dark: false, openSelect: false },
  { file: "apply-1440-dark.png", width: 1440, height: 900, dark: true, openSelect: true },
];

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const shot of shots) {
    await page.setViewportSize({ width: shot.width, height: shot.height });
    await page.goto(`${base}/careers/research-analyst#apply`, { waitUntil: "networkidle" });
    await page.evaluate((dark) => {
      localStorage.setItem("diqualia-theme", dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", dark);
      window.dispatchEvent(new Event("diqualia-theme-change"));
    }, shot.dark);
    await page.locator("#apply").scrollIntoViewIfNeeded();
    if (shot.openSelect) {
      const gender = page.getByRole("combobox", { name: /gender/i });
      await gender.scrollIntoViewIfNeeded();
      await gender.click();
      await page.getByRole("listbox").waitFor();
    }
    await page.screenshot({ path: path.join(outDir, shot.file), fullPage: false });
    console.log("wrote", shot.file);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
