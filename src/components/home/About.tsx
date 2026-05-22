import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const stats = [
  { n: 7, label: "Years building" },
  { n: 3, label: "Languages" },
  { n: "240+", label: "Photos kept" },
];

const facts = [
  { k: "Education", v: "Double Bachelor's, East China University of Science & Technology · exchange studies in Germany" },
  { k: "Based in", v: "Tokyo — previously Shanghai (7 years)" },
  { k: "Languages", v: "中文 · English · 日本語" },
];

export function About() {
  return (
    <section id="about" className="px-[5vw] py-32 max-w-[var(--container-site)] mx-auto">
      <div className="flex items-baseline gap-5 mb-16">
        <span className="text-xs tracking-[.2em] text-accent">01</span>
        <h2 className="font-serif text-[clamp(1.7rem,3.4vw,2.7rem)] tracking-tight">About</h2>
      </div>
      <div className="grid gap-16 md:grid-cols-[1fr_1.25fr] items-start">
        <RevealOnScroll as="p" className="font-serif font-light text-[clamp(1.6rem,2.9vw,2.3rem)] leading-[1.32] tracking-tight">
          A frontend engineer drawn to hard problems — <em className="italic text-accent">performance, algorithms,</em> and the platforms other engineers build on.
        </RevealOnScroll>
        <RevealOnScroll delayMs={100}>
          <p className="text-muted text-[1.06rem]">
            Seven years building software in Shanghai — most recently as a frontend expert at Alibaba, and before that a frontend engineer at ByteDance, where I worked across big-data, cloud-native, and AI platforms: from an AI-agent builder to large-model training and inference. I care about fast, well-crafted interfaces and clean abstractions. Now I'm based in Tokyo — writing in three languages and photographing whenever the light is good.
          </p>
          <div className="flex gap-12 mt-12 flex-wrap">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-serif font-light text-[2.7rem] tracking-tight">{s.n}</div>
                <div className="text-xs tracking-[.14em] uppercase text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <dl className="mt-10 border-t border-line pt-7 flex flex-col gap-4">
            {facts.map((f) => (
              <div key={f.k} className="grid md:grid-cols-[118px_1fr] gap-4 items-baseline">
                <dt className="text-[11px] tracking-[.16em] uppercase text-accent">{f.k}</dt>
                <dd className="text-muted text-[.98rem] leading-relaxed">{f.v}</dd>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </div>
    </section>
  );
}
