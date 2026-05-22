const SKILLS = ["React","TypeScript","JavaScript","Node.js","Angular","RxJS","Zustand","Formily","Tailwind","GraphQL","ECharts","Kubernetes","Docker","MySQL","PHP","HTML5"];

export function SkillsMarquee() {
  const list = [...SKILLS, ...SKILLS];
  return (
    <section className="overflow-hidden border-y border-line py-8" style={{
      WebkitMaskImage: "linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)",
      maskImage: "linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent)",
    }}>
      <div className="marquee-track flex w-max" style={{ animation: "scrollx 32s linear infinite" }}>
        {list.map((s, i) => (
          <span key={i} className="font-serif italic font-light text-[1.7rem] text-muted flex items-center after:content-['—'] after:not-italic after:text-accent after:mx-9">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}
