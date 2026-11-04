import { expect, test } from "@playwright/test";

// Smoke tests for the pages router UI. These hit AniList and MangaDex live.

test("home page shows anime and manga", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation")).toBeVisible();
  await expect(page.locator('a[href^="/anime/"]').first()).toBeVisible();
  await expect(page.locator('a[href^="/manga/"]').first()).toBeVisible();
});

test("anime detail page renders a title from AniList", async ({ page }) => {
  await page.goto("/anime/52991"); // Frieren, by MAL id
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Frieren");
});

test("an unknown anime id is a 404", async ({ page }) => {
  const res = await page.goto("/anime/not-an-id");
  expect(res?.status()).toBe(404);
});

test("private pages are marked noindex", async ({ request }) => {
  const res = await request.get("/Login");
  expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
});
