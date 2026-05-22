import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "iPhone SE/14 portrait", width: 375, height: 812 },
  { name: "Pixel 7", width: 393, height: 851 },
  { name: "iPad portrait", width: 768, height: 1024 },
  { name: "iPad landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`home has no horizontal scroll at ${vp.width}px (${vp.name})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/");
    // Wait for layout to settle (fonts, marquee, etc.)
    await page.waitForLoadState("networkidle");

    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    expect(scrollWidth, `scrollWidth (${scrollWidth}) exceeds innerWidth (${innerWidth}) at ${vp.width}px`).toBeLessThanOrEqual(innerWidth + 1);
  });
}
