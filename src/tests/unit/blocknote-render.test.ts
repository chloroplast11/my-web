import { describe, it, expect } from "vitest";
import { renderPostHtml } from "@/lib/blocknote/render";

describe("renderPostHtml", () => {
  it("renders paragraph blocks to <p>", async () => {
    const blocks = [{ id: "1", type: "paragraph", props: {}, content: [{ type: "text", text: "hello", styles: {} }], children: [] }];
    const html = await renderPostHtml(blocks);
    expect(html).toMatch(/<p[^>]*>hello<\/p>/);
  });

  it("highlights code blocks with shiki", async () => {
    const blocks = [{ id: "1", type: "codeBlock", props: { language: "ts" }, content: [{ type: "text", text: "const x = 1;", styles: {} }], children: [] }];
    const html = await renderPostHtml(blocks);
    expect(html).toContain("shiki");
    expect(html).toContain("const");
  });
});
