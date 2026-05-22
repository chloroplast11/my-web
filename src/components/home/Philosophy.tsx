import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Philosophy() {
  return (
    <section className="px-[5vw] py-48 text-center max-w-[var(--container-site)] mx-auto">
      <RevealOnScroll className="text-xs tracking-[.24em] text-muted uppercase justify-center flex items-center gap-3 before:content-[''] before:w-6 before:h-px before:bg-accent">
        03 — Philosophy
      </RevealOnScroll>
      <RevealOnScroll as="p" delayMs={150} className="font-serif font-light text-[clamp(1.9rem,4.8vw,3.6rem)] leading-[1.28] max-w-[19ch] mx-auto mt-7 tracking-tight">
        Build like a craftsman, ship like a pragmatist, and never stop <em className="italic text-accent">looking at the light.</em>
      </RevealOnScroll>
    </section>
  );
}
