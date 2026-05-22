import { test, expect } from "@playwright/test";

test("healthz returns ok", async ({ request }) => {
  const res = await request.get("/healthz");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ ok: true });
});
