// src/components/home/bento/BentoStage.tsx
import { cn } from "@/lib/cn";

// Reference inner-box dimensions. CardFrame and PostmarkLayer treat their
// incoming pixel coords as positions inside this box, then express them as
// percentages so the bento scales cleanly on wider screens without rasterized
// text getting fuzzy (which is what `transform: scale` would cause).
export const BENTO_REF_W = 880;
export const BENTO_REF_H = 380;

export function BentoStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative mx-auto min-h-screen px-5 py-10",
        "max-w-[880px] xl:max-w-[1100px] 2xl:max-w-[1300px]",
        "md:flex md:items-center md:justify-center",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full grid grid-cols-2 gap-3 md:block",
          "md:h-[380px] xl:h-[475px] 2xl:h-[560px]",
        )}
      >
        {children}
      </div>
    </main>
  );
}
