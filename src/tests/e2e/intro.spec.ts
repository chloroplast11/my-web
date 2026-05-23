import { test, expect } from "@playwright/test";

test("intro overlay shows greetings on first visit and disappears", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/");
  await expect(page.getByText("你好")).toBeVisible();
  await expect(page.getByText("こんにちは")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator("[data-intro-overlay]")).toBeHidden({ timeout: 8_000 });
});

test("intro is skipped on second visit in the same session", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("[data-intro-overlay]", { state: "hidden", timeout: 8_000 });
  await page.reload();
  await expect(page.locator("[data-intro-overlay]")).toHaveCount(0);
});
