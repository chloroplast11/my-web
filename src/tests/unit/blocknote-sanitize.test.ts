import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "@/lib/blocknote/sanitize";

describe("sanitizeHtml", () => {
  it("strips <script>", () => {
    expect(sanitizeHtml("<p>hi</p><script>alert(1)</script>")).toBe("<p>hi</p>");
  });
  it("strips inline event handlers", () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
  });
  it("keeps safe links with rel=noopener added for target=_blank", () => {
    const out = sanitizeHtml('<a href="https://x" target="_blank">x</a>');
    expect(out).toContain("rel=");
    expect(out).toContain("noopener");
  });
});
