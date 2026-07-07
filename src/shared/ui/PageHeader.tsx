/**
 * Page Header Component
 *
 * Global reusable page header used across all pages. Built on the
 * HeadingPrimary design-system component (accent bar + two-font title)
 * with an optional subtitle in uppercase with wide tracking.
 */

import { ReactNode } from "react";
import { HeadingPrimary } from "@/features/ui/heading-primary";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Main title text before the highlighted word */
  title: string;
  /** Highlighted word shown in the accent color */
  highlightedWord: string;
  /** Optional subtitle text */
  subtitle?: string | ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

export function PageHeader({
  title,
  highlightedWord,
  subtitle,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("xl:col-span-12 space-y-4", className)}>
      <HeadingPrimary
        as="h1"
        variant="title"
        title={title}
        highlightedWord={highlightedWord}
        accentColor="brandPurple"
      />

      {subtitle &&
        (typeof subtitle === "string" ? (
          <Span variant="default" className="opacity-40 tracking-[0.5em]">
            {subtitle}
          </Span>
        ) : (
          <div>{subtitle}</div>
        ))}
    </div>
  );
}
