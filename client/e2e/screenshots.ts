// Captures the README screenshots: `npx tsx e2e/screenshots.ts` with the dev server running
import { chromium, devices } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "../docs/screenshots";
const shots = [
  { name: "home", path: "/" },
  { name: "anime", path: "/anime/52991" },
  { name: "manga", path: "/manga" },
  { name: "search", path: "/search?genre=Fantasy&sort=score" },
];

(async () => {
  const browser = await chromium.launch();
  for (const [suffix, opts] of [
    ["desktop", { viewport: { width: 1440, height: 900 } }],
    ["mobile", devices["Pixel 7"]],
  ] as const) {
    const page = await browser.newPage(opts);
    for (const s of shots) {
      await page.goto(BASE + s.path, { waitUntil: "networkidle" });
      await page.screenshot({ path: `${OUT}/${s.name}-${suffix}.png` });
    }
    await page.close();
  }
  await browser.close();
})();
