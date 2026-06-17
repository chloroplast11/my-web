// src/components/home/bento/BentoStage.tsx
import { cn } from "@/lib/cn";

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
        "relative mx-auto max-w-[880px] min-h-screen px-5 py-10",
        "md:flex md:items-center md:justify-center",
        className,
      )}
    >
      <div className="relative w-full grid grid-cols-2 gap-3 md:block md:h-[380px]">
        {children}
      </div>
    </main>
  );
}
