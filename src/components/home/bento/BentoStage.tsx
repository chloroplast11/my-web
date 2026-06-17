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
        "flex items-center justify-center",
        className,
      )}
    >
      <div className="relative w-full" style={{ height: 380 }}>
        {children}
      </div>
    </main>
  );
}
