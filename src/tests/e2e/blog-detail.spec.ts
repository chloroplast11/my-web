import { test, expect } from "@playwright/test";

test("blog detail 404s for unknown slug", async ({ page }) => {
  const res = await page.goto("/blog/does-not-exist");
  expect(res?.status()).toBe(404);
});
