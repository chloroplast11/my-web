import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Container } from "@/components/ui/Container";

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
    <Container className="py-32">
      <div className="grid grid-cols-[140px_1fr_auto] max-md:grid-cols-[80px_1fr_auto] gap-7 max-md:gap-4 items-baseline mb-16 px-6 max-md:px-4">
        <div className="text-xs tracking-[.2em] text-accent">02</div>
        <h2 className="font-serif text-[clamp(1.7rem,3.4vw,2.7rem)]">Experience</h2>
        <span />
      </div>
      <div className="border-t border-line">
        {rows.map((r) => (
          <RevealOnScroll
            key={r.year}
            className="grid grid-cols-[140px_1fr_auto] max-md:grid-cols-[80px_1fr_auto] gap-7 max-md:gap-4 items-center px-6 max-md:px-4 py-8 border-b border-line hover:pl-10 hover:bg-accent/[.06] transition-all duration-300"
          >
            <div className="text-[13px] tracking-wider text-accent">{r.year}</div>
            <div>
              <div className="font-serif text-2xl tracking-tight">{r.role}</div>
              <div className="text-muted text-[.96rem] mt-1">{r.company}</div>
              {r.note && (
                <div className="text-muted text-sm mt-2 max-w-[56ch] leading-relaxed">
                  {r.note}
                </div>
              )}
            </div>
            <div className="text-faint text-xl">↗</div>
          </RevealOnScroll>
        ))}
      </div>
    </Container>
  );
}
