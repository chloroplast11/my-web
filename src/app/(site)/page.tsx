import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Experience } from "@/components/home/Experience";
import { SkillsMarquee } from "@/components/home/SkillsMarquee";
import { Philosophy } from "@/components/home/Philosophy";
import { Featured } from "@/components/home/Featured";
import { Contact } from "@/components/home/Contact";
import { PersonJsonLd } from "@/components/seo/PersonJsonLd";

export default async function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <SkillsMarquee />
      <Philosophy />
      <Featured />
      <Contact />
      <PersonJsonLd />
    </>
  );
}
