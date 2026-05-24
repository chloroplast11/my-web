import { test, expect } from "@playwright/test";

test("clicking an inline image in a blog post opens the lightbox", async ({ page }) => {
  await page.goto("/blog");
  const firstPost = page.locator("a[href^='/blog/']").first();
  await firstPost.click();

  const inlineImg = page.locator("article img").first();
  if (await inlineImg.count() === 0) test.skip(true, "no inline image in seeded post");

  await inlineImg.click();
  await expect(page.locator(".yarl__container")).toBeVisible();
});
