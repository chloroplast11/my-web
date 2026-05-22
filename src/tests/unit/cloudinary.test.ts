import { describe, it, expect, vi, beforeEach } from "vitest";

describe("cloudinary helper", () => {
  beforeEach(() => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    vi.resetModules();
  });

  it("buildSignedUploadParams returns timestamp + signature + apiKey", async () => {
    const { buildSignedUploadParams } = await import("@/lib/cloudinary");
    const params = buildSignedUploadParams({ folder: "photos" });
    expect(params).toHaveProperty("timestamp");
    expect(params).toHaveProperty("signature");
    expect(params).toHaveProperty("apiKey", "key");
    expect(params).toHaveProperty("cloudName", "demo");
    expect(params).toHaveProperty("folder", "photos");
  });
});
