import { test, expect } from "@playwright/test";

test("anonymous user is redirected away from /write", async ({ page }) => {
  await page.goto("/write");
  await page.waitForURL((url) => url.pathname === "/", { timeout: 5_000 });
  expect(new URL(page.url()).pathname).toBe("/");
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

  test("admin sees 'preview · live' banner on /preview of published post", async ({ page }) => {
    // Seed a published post via admin posts/new + publish
    const title = `E2E pub preview ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.locator("input[required]").first().fill(title);
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: "visible", timeout: 15_000 });
    await editor.click();
    await page.keyboard.type("seeded body");
    await page.getByRole("button", { name: /create draft/i }).click();
    await page.waitForURL(/\/admin\/posts\/.+\/edit/, { timeout: 15_000 });
    await page.getByRole("button", { name: /^publish$/i }).click();
    await expect(page.getByRole("button", { name: /unpublish/i })).toBeVisible({ timeout: 10_000 });

    const slug = title.toLowerCase().replace(/\s+/g, "-");
    await page.goto(`/preview/${slug}`);
    await expect(page.locator('[data-status="published"]')).toBeVisible();
    await expect(page.getByText(/preview · live/i)).toBeVisible();
  });
});
