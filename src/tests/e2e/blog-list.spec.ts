import { test, expect } from "@playwright/test";

test("blog list renders heading and language filter", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: /writing/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "All", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "EN", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "ZH", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "JA", exact: true })).toBeVisible();
});
