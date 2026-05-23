import { siteConfig } from "@/lib/site-config";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function Contact() {
  return (
    <section id="contact" className="px-[5vw] py-48 text-center max-w-[var(--container-site)] mx-auto">
      <RevealOnScroll className="text-xs tracking-[.24em] text-muted uppercase justify-center flex items-center gap-3 mb-9 before:content-[''] before:w-6 before:h-px before:bg-accent">
        06 — Contact
      </RevealOnScroll>
      <h2 className="font-serif font-light text-[clamp(2.8rem,9.5vw,7.2rem)] leading-none tracking-tight">
        Let’s make <em className="italic text-accent">something.</em>
      </h2>
      <a href={`mailto:${siteConfig.email}`} className="block text-[clamp(.95rem,1.6vw,1.15rem)] text-muted mt-10 hover:text-accent transition">
        {siteConfig.email}
      </a>
      <div className="flex gap-8 justify-center mt-8 text-sm text-muted">
        <a href={siteConfig.socials.github} target="_blank" rel="noopener" className="hover:text-accent">GitHub</a>
        <a href={siteConfig.socials.linkedin} target="_blank" rel="noopener" className="hover:text-accent">LinkedIn</a>
        <a href={siteConfig.socials.twitter} target="_blank" rel="noopener" className="hover:text-accent">Twitter</a>
      </div>
    </section>
  );
}
