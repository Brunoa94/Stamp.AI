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
 * - Adds right padding to account for the fixed right-side navigation menu
 * - The nav is positioned at right-10 (40px) and takes ~200px width
 * - We add pr-64 (256px) on desktop to ensure content doesn't overlap with nav
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
        "pr-8 lg:pr-20 [&>*:first-child]:mt-0 [&>*:first-child]:mb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
