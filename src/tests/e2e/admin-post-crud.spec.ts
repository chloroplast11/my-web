import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByPlaceholder("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  // wait for redirect off /admin/login (the login page uses window.location.href)
  await page.waitForURL((url) => !url.pathname.endsWith("/admin/login"), { timeout: 10_000 });
});

test("admin can create, publish, and view a post", async ({ page }) => {
  const title = `E2E test ${Date.now()}`;
  await page.goto("/admin/posts/new");
  await page.locator("input[required]").first().fill(title);

  // BlockNote editor lazy-loads via next/dynamic; wait for it to be editable
  // and type a paragraph so contentJson is non-empty before submitting.
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.waitFor({ state: "visible", timeout: 15_000 });
  await editor.click();
  await page.keyboard.type("E2E test body");

  await page.getByRole("button", { name: /create draft/i }).click();
  await page.waitForURL(/\/admin\/posts\/.+\/edit/, { timeout: 15_000 });
  await page.getByRole("button", { name: /^publish$/i }).click();
  // after publish, the page rerenders with an "Unpublish" button — wait for it
  await expect(page.getByRole("button", { name: /unpublish/i })).toBeVisible({ timeout: 10_000 });

  const slug = title.toLowerCase().replace(/\s+/g, "-");
  await page.goto(`/blog/${slug}`);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.goto("/admin/posts");
  const row = page.locator("tr", { hasText: title });
  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.locator("tr", { hasText: title })).toHaveCount(0, { timeout: 10_000 });
});
