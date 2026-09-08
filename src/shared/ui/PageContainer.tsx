import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { containerTheme } from "@/theme/components";

interface PropsI {
  children: ReactNode;
  className?: string;
}

/**
 * Reusable page container component for consistent layout across all pages
 *
 * This container:
 * - Uses full width (w-full) for maximum space utilization
 * - Maintains responsive padding for mobile where nav is hidden
 *
 * Note: First child margins are removed via [&>*:first-child]:mt-0 to prevent
 * unwanted spacing at the top of the container
 */
export function PageContainer({ children, className }: PropsI) {
  return (
    <div
      className={cn(
        containerTheme.pageContent,
        "[&>*:first-child]:mt-0 [&>*:first-child]:mb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
