import { test, expect } from "@playwright/test";

test("admin featured page renders sections and library options", async ({ page }) => {
  await page.goto("/admin/featured");
  await expect(page.getByRole("heading", { name: "Featured on Home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Photos" })).toBeVisible();

  const selects = page.locator("select");
  await expect(selects).toHaveCount(2);
});
