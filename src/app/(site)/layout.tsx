import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <SiteNav />
      {children}
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
