import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("lowercases and dasherizes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("strips punctuation", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });
  it("collapses whitespace + dashes", () => {
    expect(slugify("  too   many   spaces  ")).toBe("too-many-spaces");
  });
  it("preserves cjk characters", () => {
    expect(slugify("关于工程师的审美")).toBe("关于工程师的审美");
  });
  it("trims leading and trailing dashes", () => {
    expect(slugify("--hi--")).toBe("hi");
  });
});
