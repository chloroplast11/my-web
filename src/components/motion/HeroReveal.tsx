"use client";
import { motion } from "framer-motion";

export function HeroReveal({ lines }: { lines: React.ReactNode[] }) {
  return (
    <h1 className="font-serif font-light text-[clamp(2.8rem,8.5vw,6.8rem)] leading-[1.02] tracking-tight max-w-[15ch]">
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.05, delay: 0.45 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}
