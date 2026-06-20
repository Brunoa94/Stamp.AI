import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { accentColors, type AccentColorT } from "../lib/constants/accentColors";

interface PropsI {
  children: ReactNode;
  accentColor?: AccentColorT;
  className?: string;
}

export function BrutalistCard({
  children,
  accentColor = "purple",
  className,
}: PropsI) {
  return (
    <section
      className={cn(
        "brutalist-card p-8 md:p-10 border-l-4 transition-all duration-300",
        accentColors[accentColor],
        className,
      )}
    >
      {children}
    </section>
  );
}
