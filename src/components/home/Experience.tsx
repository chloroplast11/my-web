import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const rows = [
  {
    year: "2025",
    role: "Frontend Engineering Expert",
    company: "Alibaba Group · Shanghai",
    note: "Frontend architecture and performance for enterprise-scale platforms.",
  },
  {
    year: "2022 — 2025",
    role: "Frontend Engineer",
    company: "ByteDance · Shanghai",
    note: "Built developer and AI platforms — big-data, cloud-native, an AI-agent builder, AI applications, and large-model training & inference. Focused on performance and algorithms.",
  },
  {
    year: "2018 — 2022",
    role: "Full-Stack Engineer",
    company: "Earlier roles · Shanghai",
  },
];

export function Experience() {
  return (
    <section className="px-[5vw] py-32 max-w-[var(--container-site)] mx-auto">
      <div className="flex items-baseline gap-5 mb-16">
        <span className="text-xs tracking-[.2em] text-accent">02</span>
        <h2 className="font-serif text-[clamp(1.7rem,3.4vw,2.7rem)]">Experience</h2>
      </div>
      <div className="border-t border-line">
        {rows.map((r) => (
          <RevealOnScroll key={r.year} className="grid grid-cols-[140px_1fr_auto] max-md:grid-cols-[80px_1fr_auto] gap-7 max-md:gap-4 items-center py-8 border-b border-line hover:pl-6 hover:bg-accent/[.06] transition-all duration-300">
            <div className="text-[13px] tracking-wider text-accent">{r.year}</div>
            <div>
              <div className="font-serif text-2xl tracking-tight">{r.role}</div>
              <div className="text-muted text-[.96rem] mt-1">{r.company}</div>
              {r.note && <div className="text-muted text-sm mt-2 max-w-[56ch] leading-relaxed">{r.note}</div>}
            </div>
            <div className="text-faint text-xl">↗</div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
