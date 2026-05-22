"use client";
import { useEffect } from "react";

export function CodeBlockEnhancer() {
  useEffect(() => {
    document.querySelectorAll("article pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const btn = document.createElement("button");
      btn.className = "copy-btn absolute top-2 right-2 text-xs px-2 py-1 rounded bg-ink/10 text-muted hover:text-ink";
      btn.textContent = "Copy";
      btn.addEventListener("click", async () => {
        const text = pre.querySelector("code")?.textContent ?? "";
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        setTimeout(() => (btn.textContent = "Copy"), 1200);
      });
      (pre as HTMLElement).style.position = "relative";
      pre.appendChild(btn);
    });
  }, []);
  return null;
}
