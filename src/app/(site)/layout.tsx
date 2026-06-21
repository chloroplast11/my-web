import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { IntroOverlay } from "@/components/motion/IntroOverlay";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { MusicPlayerProvider } from "@/lib/music-player-context";
import { FloatingMusicWidget } from "@/components/music/FloatingMusicWidget";
import { pickRandomIndex } from "@/lib/music-playlist";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // Picked at layout-render time so the homepage shows a random starting
  // track. The provider lives here so audio keeps playing across in-site
  // client-side navigations.
  const initialMusicIndex = pickRandomIndex();
  return (
    <SmoothScrollProvider>
      <MusicPlayerProvider initialIndex={initialMusicIndex}>
        <TopProgressBar />
        <IntroOverlay />
        <SiteNav />
        {children}
        <SiteFooter />
        <FloatingMusicWidget />
      </MusicPlayerProvider>
    </SmoothScrollProvider>
  );
}
