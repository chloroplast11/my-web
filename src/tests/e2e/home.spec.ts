import { test, expect } from "@playwright/test";

test("home hero shows name, headline, and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Frontend Engineer & Photographer/i)).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/chase/i);
  await expect(page.getByRole("link", { name: /read the writing/i })).toHaveAttribute("href", "/blog");
  await expect(page.getByRole("link", { name: /see the photographs/i })).toHaveAttribute("href", "/photos");
});

test("about section shows stats and meta facts", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
  await expect(page.getByText(/Years building/i).first()).toBeVisible();
  await expect(page.getByText(/Languages/).first()).toBeVisible();
  await expect(page.getByText(/East China University/i)).toBeVisible();
});

test("experience lists alibaba, bytedance, earlier", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Frontend Engineering Expert/i)).toBeVisible();
  await expect(page.getByText(/Alibaba Group/i)).toBeVisible();
  await expect(page.getByText(/ByteDance/i).first()).toBeVisible();
  await expect(page.getByText(/2018 — 2022/)).toBeVisible();
});

test("contact has email + social links", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("section#contact")).toContainText("@");
  await expect(page.getByRole("link", { name: /GitHub/i })).toBeVisible();
});
