import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByPlaceholder("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/admin/login"), { timeout: 10_000 });
});

test("admin featured page renders sections and library options", async ({ page }) => {
  await page.goto("/admin/featured");
  await expect(page.getByRole("heading", { name: "Featured on Home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();

  const selects = page.locator("select");
  await expect(selects).toHaveCount(2);
});
