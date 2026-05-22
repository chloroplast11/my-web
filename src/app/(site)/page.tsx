import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Experience } from "@/components/home/Experience";
import { SkillsMarquee } from "@/components/home/SkillsMarquee";
import { Philosophy } from "@/components/home/Philosophy";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <SkillsMarquee />
      <Philosophy />
    </>
  );
}
