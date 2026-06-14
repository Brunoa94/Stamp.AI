import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { containerTheme } from "@/theme/components";

interface PropsI {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable page container component for consistent layout across all pages
 * Uses the shared pageContent container from the theme system
 * Default max-width: screen-2xl (1536px)
 */
export function PageContainer({ children, className }: PropsI) {
  return (
    <div className={cn(containerTheme.pageContent, className)}>
      {children}
    </div>
  );
}
