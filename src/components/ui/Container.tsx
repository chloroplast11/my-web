import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function Container({ children, className, as: Tag = "section" }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto max-w-[var(--container-site)] px-[5vw]", className)}>
      {children}
    </Tag>
  );
}
