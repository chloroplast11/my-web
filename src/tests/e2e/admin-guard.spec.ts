import { test, expect } from "@playwright/test";

test("unauthenticated /admin redirects to /admin/login", async ({ page }) => {
  const res = await page.goto("/admin");
  expect(page.url()).toContain("/admin/login");
  expect(res?.status()).toBeLessThan(500);
});

test("/admin/login is reachable without auth", async ({ page }) => {
  const res = await page.goto("/admin/login");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});
