"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SHOW_AFTER_MS = 150;

export function TopProgressBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    // Intercept link clicks that trigger client-side navigation.
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || target.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      setPhase("loading");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // When the pathname actually changes, mark done.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase === "loading") {
      setPhase("done");
      const t = setTimeout(() => setPhase("idle"), 250);
      return () => clearTimeout(t);
    }
  }, [pathname]); // intentionally not depending on phase

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none"
      style={{
        background: "var(--color-accent)",
        opacity: phase === "done" ? 0 : 1,
        transform: phase === "loading" ? "scaleX(0.7)" : "scaleX(1)",
        transformOrigin: "left",
        transition: "transform 600ms ease-out, opacity 250ms ease-out",
        animation: phase === "loading" ? `tpb-grow ${SHOW_AFTER_MS}ms linear` : undefined,
      }}
    />
  );
}
