import { siteConfig } from "@/lib/site-config";

const EXPERIENCE = [
  {
    years: "2025 —",
    role: "Frontend Engineering Expert",
    org: "Alibaba Group · Shanghai",
    note: "Frontend architecture and performance for enterprise-scale platforms.",
  },
  {
    years: "2022 — 2025",
    role: "Frontend Engineer",
    org: "ByteDance · Shanghai",
    note:
      "Built developer and AI platforms — big-data, cloud-native, an AI-agent builder, AI applications, and large-model training & inference. Focused on performance and algorithms.",
  },
  {
    years: "2018 — 2022",
    role: "Full-Stack Engineer",
    org: "Earlier roles · Shanghai",
  },
];

const SKILLS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Angular",
  "RxJS", "Zustand", "Formily", "Tailwind", "GraphQL",
  "ECharts", "Kubernetes", "Docker", "MySQL",
];

export default async function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col gap-12 px-6 py-24">
      <header>
        <h1 className="font-serif text-4xl font-bold text-ink xl:text-5xl">
          Chuck Chen
        </h1>
        <p className="mt-2 text-sm text-muted">Frontend engineer · Tokyo</p>
      </header>

      <section>
        <p className="font-serif text-2xl leading-snug text-ink xl:text-[28px]">
          I build thoughtful things, and chase good light.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-faint">About</h2>
        <p className="text-sm leading-relaxed text-ink xl:text-base">
          Seven years building software in Shanghai — most recently as a
          frontend expert at Alibaba, and before that a frontend engineer at
          ByteDance, where I worked across big-data, cloud-native, and AI
          platforms: from an AI-agent builder to large-model training and
          inference. I care about fast, well-crafted interfaces and clean
          abstractions. Now based in Tokyo — writing in three languages and
          photographing whenever the light is good.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 border-y border-line-2 py-6 sm:grid-cols-3">
        <Fact label="Based in">
          Tokyo
          <span className="block text-muted">previously Shanghai (7 years)</span>
        </Fact>
        <Fact label="Languages">中文 · English · 日本語</Fact>
        <Fact label="Education">
          East China University of Science &amp; Technology
          <span className="block text-muted">exchange studies in Germany</span>
        </Fact>
      </section>

      <section>
        <h2 className="mb-4 text-xs uppercase tracking-widest text-faint">
          Experience
        </h2>
        <ul className="flex flex-col gap-6">
          {EXPERIENCE.map((job) => (
            <li
              key={`${job.role}-${job.org}`}
              className="grid grid-cols-[6rem_1fr] gap-4"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {job.years}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{job.role}</p>
                <p className="text-sm text-muted">{job.org}</p>
                {job.note && (
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {job.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-faint">Skills</h2>
        <ul className="flex flex-wrap gap-2 text-xs">
          {SKILLS.map((s) => (
            <li
              key={s}
              className="rounded-full border border-line-2 px-3 py-1 text-muted"
            >
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-faint">
          Philosophy
        </h2>
        <p className="font-serif text-lg italic leading-snug text-ink xl:text-xl">
          Build like a craftsman, ship like a pragmatist, and never stop looking
          at the light.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-widest text-faint">Contact</h2>
        <p className="text-sm text-ink">
          <a
            className="underline-offset-2 hover:underline"
            href={`mailto:${siteConfig.email}`}
          >
            {siteConfig.email}
          </a>
          {"  ·  "}
          <a
            className="underline-offset-2 hover:underline"
            href={siteConfig.socials.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
        </p>
      </section>
    </main>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-[10px] uppercase tracking-widest text-faint">
        {label}
      </h3>
      <p className="text-sm text-ink">{children}</p>
    </div>
  );
}
