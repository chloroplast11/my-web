import { test, expect } from "@playwright/test";

test("home hero shows name, headline, and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Frontend Engineer & Photographer/i)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/chase/i);
  await expect(page.getByRole("link", { name: /read the writing/i })).toHaveAttribute("href", "/blog");
  await expect(page.getByRole("link", { name: /see the photographs/i })).toHaveAttribute("href", "/photos");
});
