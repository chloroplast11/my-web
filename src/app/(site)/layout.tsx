import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { IntroOverlay } from "@/components/motion/IntroOverlay";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <IntroOverlay />
      <SiteNav />
      {children}
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
