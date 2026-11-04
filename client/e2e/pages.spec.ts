import { expect, test } from "@playwright/test";

// Smoke tests for the public pages. These hit AniList and MangaDex live.

test("home page shows the featured title, seasonal anime and manga", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hall of Legends" })).toBeVisible();
  await expect(page.locator('main a[href^="/anime/"]').first()).toBeVisible();
  await expect(page.locator('main a[href^="/manga/"]').first()).toBeVisible();
});

test("anime detail page renders a title from AniList", async ({ page }) => {
  await page.goto("/anime/52991"); // Frieren, by MAL id
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Frieren");
  await expect(page.getByRole("heading", { name: "The tale" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Your ledger" })).toContainText("Sign in");
});

test("an unknown anime id is a 404", async ({ page }) => {
  const res = await page.goto("/anime/not-an-id");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /lost to the ages/ })).toBeVisible();
});

test("search filters by genre with a plain GET form", async ({ page }) => {
  await page.goto("/search");
  await page.getByLabel("Genre").selectOption("Fantasy");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/genre=Fantasy/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fantasy anime");
  await expect(page.locator('main a[href^="/anime/"]').first()).toBeVisible();
});

test("manga detail lists readable chapters", async ({ page }) => {
  await page.goto("/search?type=manga&q=frieren");
  await page.locator('main a[href^="/manga/"]').first().click();
  await expect(page.getByRole("heading", { name: "Chapters" })).toBeVisible();
});

test("seasons can be browsed", async ({ page }) => {
  await page.goto("/seasons?season=SPRING&year=2024");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Spring 2024");
  await expect(page.getByRole("tab", { name: "Spring" })).toHaveAttribute("aria-selected", "true");
});

test("old URLs redirect to their new homes", async ({ request }) => {
  const search = await request.get("/search/manga", { maxRedirects: 0 });
  expect(search.status()).toBe(308);
  expect(search.headers().location).toBe("/search?type=manga");
  const settings = await request.get("/settings/12", { maxRedirects: 0 });
  expect(settings.headers().location).toBe("/settings");
});

test("signed-out visitors are sent to sign in", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login\?next=%2Fsettings|\/login\?next=\/settings/);
});

test("private pages are marked noindex", async ({ request }) => {
  const res = await request.get("/login");
  expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
});
