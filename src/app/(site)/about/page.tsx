import { siteConfig } from "@/lib/site-config";

const SKILLS = [
  "TypeScript", "React", "Next.js", "Node.js",
  "Postgres", "Prisma", "Tailwind", "Framer Motion",
];

export default async function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col justify-center gap-10 px-6 py-24">
      <header className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-paper-2 ring-1 ring-line-2" aria-hidden="true" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink">Chuck Chen</h1>
          <p className="mt-1 text-sm text-muted">software engineer · Shanghai</p>
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">Now</h2>
        <p className="text-sm leading-relaxed text-ink">
          Currently building things on the side, listening to a lot of city pop,
          and trying to keep this site small and quiet.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">Skills</h2>
        <ul className="flex flex-wrap gap-2 text-xs">
          {SKILLS.map((s) => (
            <li key={s} className="rounded-full border border-line-2 px-3 py-1 text-muted">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-faint">Contact</h2>
        <p className="text-sm text-ink">
          <a className="underline-offset-2 hover:underline" href={`mailto:${siteConfig.email}`}>
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
