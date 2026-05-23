import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { processImage } from "@/lib/image-processing";

const fixture = readFileSync(path.resolve(__dirname, "../fixtures/sample.jpg"));

describe("processImage", () => {
  it("returns blurhash, dimensions, and stripped EXIF", async () => {
    const r = await processImage(fixture);
    expect(typeof r.blurhash).toBe("string");
    expect(r.blurhash.length).toBeGreaterThan(20);
    expect(r.blurDataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(r.blurDataUrl.length).toBeGreaterThan(100);
    expect(r.width).toBeGreaterThan(0);
    expect(r.height).toBeGreaterThan(0);
    expect(r.exif).toBeTypeOf("object");
    if (r.exif && "gps" in (r.exif as object)) {
      expect((r.exif as { gps?: unknown }).gps).toBeUndefined();
    }
  });
});
