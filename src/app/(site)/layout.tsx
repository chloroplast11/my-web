import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { IntroOverlay } from "@/components/motion/IntroOverlay";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <TopProgressBar />
      <IntroOverlay />
      <SiteNav />
      {children}
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
