import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Hero() {
  return (
    <header className="relative min-h-screen flex flex-col justify-center px-[5vw] pt-32 pb-24 max-w-[var(--container-site)] mx-auto">
      <RevealOnScroll className="text-xs tracking-[.24em] uppercase text-muted mb-10 flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-accent">
        Chuck Chen — Frontend Engineer & Photographer, Tokyo
      </RevealOnScroll>
      <h1 className="font-serif font-light text-[clamp(2.8rem,8.5vw,6.8rem)] leading-[1.02] tracking-tight max-w-[15ch]">
        I build thoughtful things, and <em className="italic text-accent">chase good light.</em>
      </h1>
      <RevealOnScroll delayMs={100} as="p" className="mt-10 max-w-[48ch] text-[clamp(1.02rem,1.4vw,1.2rem)] text-muted">
        A frontend engineer with seven years in Shanghai, now based in Tokyo. I've built developer and AI platforms at ByteDance and Alibaba — and I write in three languages and shoot whenever the light is good.
      </RevealOnScroll>
      <RevealOnScroll delayMs={200} className="mt-12 flex gap-3 flex-wrap">
        <Link href="/blog" className="px-7 py-4 rounded-full bg-ink text-paper text-sm hover:bg-accent transition">
          Read the writing →
        </Link>
        <Link href="/photos" className="px-7 py-4 rounded-full border border-line-2 text-sm hover:border-ink transition">
          See the photographs
        </Link>
      </RevealOnScroll>
    </header>
  );
}
