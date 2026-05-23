"use client";
import { useEffect, useRef, useState } from "react";

export function StatCounter({ to, suffix = "", duration = 1300 }: { to: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      requestAnimationFrame(() => setValue(to));
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      function step(t: number) {
        const p = Math.min((t - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}
