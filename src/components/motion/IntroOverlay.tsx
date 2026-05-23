"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "intro:seen:v1";
const GREETINGS = ["你好", "Hello", "こんにちは"];

export function IntroOverlay() {
  const [phase, setPhase] = useState<"hidden" | "greet" | "clearing">("hidden");
  const [shownLines, setShownLines] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    document.body.style.overflow = "hidden";
    sessionStorage.setItem(STORAGE_KEY, "1");

    const start = window.setTimeout(() => setPhase("greet"), 0);
    const lineTimers: number[] = [];
    GREETINGS.forEach((_, i) => {
      lineTimers.push(window.setTimeout(() => setShownLines(i + 1), 240 + i * 620));
    });
    const exitAt = 240 + (GREETINGS.length - 1) * 620 + 1260;
    const exit = window.setTimeout(() => setPhase("clearing"), exitAt);
    const done = window.setTimeout(() => {
      setPhase("hidden");
      document.body.style.overflow = "";
    }, exitAt + 1200);

    return () => {
      clearTimeout(start);
      lineTimers.forEach(clearTimeout);
      clearTimeout(exit);
      clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      data-intro-overlay
      style={{ clipPath: phase === "clearing" ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)" }}
      className="fixed inset-0 z-[9999] bg-paper-2 flex items-center justify-center transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(.76,0,.24,1)]"
    >
      <div className={`flex flex-col items-center gap-1 transition-all duration-700 ease-out ${phase === "clearing" ? "opacity-0 -translate-y-3" : ""}`}>
        {GREETINGS.map((g, i) => (
          <span
            key={g}
            className={`font-serif font-light text-[clamp(1.8rem,6.2vw,3.6rem)] leading-tight text-ink transition-all duration-700 ease-out
              ${i < shownLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}
