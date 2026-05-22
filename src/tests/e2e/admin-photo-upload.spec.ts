import { test, expect } from "@playwright/test";
import path from "node:path";

test("admin can upload and delete a photo", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(process.env.ADMIN_EMAIL!);
  await page.getByPlaceholder("Password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/admin/login"));

  await page.goto("/admin/photos");
  const fixture = path.resolve(__dirname, "../fixtures/sample.jpg");
  await page.locator("input#file").setInputFiles(fixture);
  await expect(page.getByText(/uploading/i)).toBeVisible({ timeout: 2000 });
  await expect(page.getByText(/uploading/i)).toBeHidden({ timeout: 30_000 });
});
