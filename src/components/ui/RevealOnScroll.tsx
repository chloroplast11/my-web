"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export function RevealOnScroll({
  children, as: Tag = "div", delayMs = 0, className,
}: { children: React.ReactNode; as?: React.ElementType; delayMs?: number; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-1000 ease-out",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
