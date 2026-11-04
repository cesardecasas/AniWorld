import { expect, test } from "@playwright/test";

// The App Router foundation that Phase 3 pages build on

test("Dark Fantasy theme tokens and fonts load", async ({ page }) => {
  await page.goto("/design");
  const body = page.locator("body");
  await expect(body).toHaveCSS("background-color", "rgb(11, 10, 13)");
  await expect(body).toHaveCSS("color", "rgb(236, 230, 218)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-family", /Cormorant/);
});

test("the API proxy rejects cross-site writes", async ({ request }) => {
  const res = await request.post("/api/v1/comments", {
    headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" },
    data: { owner_id: "1", type: "anime", content: "csrf" },
  });
  expect(res.status()).toBe(403);
});

test("the API proxy rejects path traversal", async ({ request }) => {
  const res = await request.get("/api/v1/users/%2e%2e/admin");
  expect([400, 404]).toContain(res.status());
});
