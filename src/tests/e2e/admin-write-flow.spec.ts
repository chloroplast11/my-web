import { test, expect } from "@playwright/test";

test("anonymous user is redirected away from /write", async ({ page }) => {
  await page.goto("/write");
  await page.waitForURL("**/", { timeout: 5_000 });
  expect(page.url()).toMatch(/\/$/);
});

test("anonymous user gets 404 on /preview/[slug]", async ({ page }) => {
  const res = await page.goto("/preview/non-existent-slug");
  expect(res?.status()).toBe(404);
});

test.describe("authenticated admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByPlaceholder("Email").fill(process.env.ADMIN_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL((url) => !url.pathname.endsWith("/admin/login"), { timeout: 10_000 });
  });

  test("admin sees Write card on homepage and can write → preview a draft", async ({ page }) => {
    await page.goto("/");
    const writeLink = page.getByRole("link", { name: /write a new post/i });
    await expect(writeLink).toBeVisible();
    await writeLink.click();
    await page.waitForURL("**/write", { timeout: 5_000 });

    const title = `E2E write ${Date.now()}`;
    await page.getByRole("textbox", { name: /^title$/i }).fill(title);

    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: "visible", timeout: 15_000 });
    await editor.click();
    await page.keyboard.type("E2E preview body");

    await page.getByRole("button", { name: /save draft/i }).click();
    await page.waitForURL(/\/preview\/.+/, { timeout: 15_000 });

    await expect(page.getByText(/draft preview/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });
});
