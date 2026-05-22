import { describe, it, expect } from "vitest";
import { readingTimeMinutes } from "@/lib/reading-time";

describe("readingTimeMinutes", () => {
  it("returns at least 1 for short content", () => {
    expect(readingTimeMinutes("hello world")).toBe(1);
  });
  it("uses 220 wpm for english", () => {
    const words = Array(660).fill("word").join(" ");
    expect(readingTimeMinutes(words)).toBe(3);
  });
  it("handles cjk by char count / 500", () => {
    const cjk = "中".repeat(1500);
    expect(readingTimeMinutes(cjk)).toBe(3);
  });
});
