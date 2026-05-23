import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByPlaceholder("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/admin/login"), { timeout: 10_000 });
});

test("clicking Delete on a tag opens confirmation; Cancel keeps the row", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "single-browser smoke");
  await page.goto("/admin/tags");

  const name = `confirm-${Date.now()}`;
  await page.locator('input[name="name"]').fill(name);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText(name)).toBeVisible();

  const row = page.locator("li", { hasText: name });
  await row.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText(`Delete "${name}"?`)).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText(name)).toBeVisible();

  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(name)).toBeHidden();
});
