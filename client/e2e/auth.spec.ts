import { expect, test } from "@playwright/test";

// Full sign-up → sign-in → sign-out through the /api/v1 proxy. Needs the AniWorld API running
// (locally: `DB_NAME=AniAPI_test npm start` in AniWorldAPI); skipped when it isn't reachable.

const API_URL = process.env.API_URL ?? "http://localhost:3001";

test.beforeAll(async ({ request }) => {
  const up = await request.get(`${API_URL}/health`).then((r) => r.ok(), () => false);
  test.skip(!up, `AniWorld API not reachable at ${API_URL}`);
});

test("sign up, sign in with an httpOnly cookie, and sign out", async ({ page, context }, testInfo) => {
  const id = `${testInfo.project.name}${Date.now()}`.slice(-24);
  const email = `e2e-${id}@test.com`;

  await page.goto("/signup");
  await page.getByLabel("Username").fill(`u${id}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/Login$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  const session = (await context.cookies()).find((c) => c.name === "aw_session");
  expect(session?.httpOnly).toBe(true);
  expect(session?.sameSite).toBe("Lax");
  // Scripts on the page can't read the token
  expect(await page.evaluate(() => document.cookie)).not.toContain("aw_session");

  const me = await page.request.get("/api/v1/auth/session");
  expect((await me.json()).user.userName).toBe(`u${id}`);

  await page.request.post("/api/v1/auth/logout", { headers: { origin: "http://localhost:3000" } });
  expect((await context.cookies()).find((c) => c.name === "aw_session")).toBeUndefined();
  expect((await page.request.get("/api/v1/auth/session")).status()).toBe(401);
});

test("a wrong password shows the API's error", async ({ page }) => {
  await page.goto("/Login");
  await page.getByLabel("Email").fill("nobody@test.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(/invalid/i)).toBeVisible();
});
