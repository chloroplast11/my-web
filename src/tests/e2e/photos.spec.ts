import { test, expect } from "@playwright/test";

test("photos page renders heading and grid container", async ({ page }) => {
  await page.goto("/photos");
  await expect(page.getByRole("heading", { name: /photography/i })).toBeVisible();
});
