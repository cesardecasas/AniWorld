import { expect, test } from "@playwright/test";

// Sign-up → sign-in → ledger → account deletion through the /api/v1 proxy. Needs the AniWorld API
// running (locally: `DB_NAME=AniAPI_test npm start` in AniWorldAPI); skipped when it isn't reachable.

const API_URL = process.env.API_URL ?? "http://localhost:3001";

test.beforeAll(async ({ request }) => {
  const up = await request.get(`${API_URL}/health`).then((r) => r.ok(), () => false);
  test.skip(!up, `AniWorld API not reachable at ${API_URL}`);
});

test("sign up, keep a ledger, and delete the account", async ({ page, context }, testInfo) => {
  test.setTimeout(120_000);
  const id = `${testInfo.project.name}${Date.now()}`.slice(-24);
  const userName = `u${id}`;
  const email = `e2e-${id}@test.com`;

  await page.goto("/signup");
  await page.getByLabel("Username").fill(userName);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\?registered=1/);
  await expect(page.getByRole("status")).toContainText("Your account is ready");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: userName })).toBeVisible();

  const session = (await context.cookies()).find((c) => c.name === "aw_session");
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");
  // Scripts on the page can't read the token
  expect(await page.evaluate(() => document.cookie)).not.toContain("aw_session");

  // Add Frieren to the ledger and rate it
  await page.goto("/anime/52991");
  const ledger = page.getByRole("complementary", { name: "Your ledger" });
  await ledger.getByRole("button", { name: "Add to Ledger" }).click();
  await expect(ledger.getByLabel("Status")).toHaveValue("planned");
  await ledger.getByRole("button", { name: "One episode forward" }).click();
  await expect(ledger.getByLabel("Status")).toHaveValue("in_progress");
  await ledger.getByRole("button", { name: "Rate 9 out of 10" }).click();
  await expect(ledger.getByRole("button", { name: "Rate 9 out of 10" })).toHaveAttribute("aria-pressed", "true");

  // It shows on the ledger page, which the owner can edit
  await page.getByRole("link", { name: "My Ledger" }).click();
  await expect(page).toHaveURL(/\/list\/\d+$/);
  const row = page.getByRole("row", { name: /Frieren/ });
  await expect(row).toContainText("Watching");
  await expect(row).toContainText("9");
  await row.getByRole("button", { name: /Edit/ }).click();
  await page.getByRole("combobox", { name: "Status" }).selectOption("completed");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("row", { name: /Frieren/ })).toContainText("Completed");

  // Delete the account so test runs don't pile up users
  await page.goto("/settings");
  await page.getByLabel(/Type your username/).fill(userName);
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  expect((await page.request.get("/api/v1/auth/session")).status()).toBe(401);
});

test("a wrong password shows the API's error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@test.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(/invalid/i);
});

test("the login page ignores off-site next links", async ({ page }) => {
  await page.goto("/login?next=//evil.example");
  await expect(page.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
});
