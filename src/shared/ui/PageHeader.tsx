/**
 * Page Header Component
 *
 * Global reusable page header used across all pages with:
 * - Purple accent bar
 * - Large Anton typography with purple accent on highlighted word
 * - Optional subtitle in uppercase with wide tracking
 */

import { ReactNode } from "react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Main title text before the highlighted word */
  title: string;
  /** Highlighted word shown in purple */
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
      {/* Purple accent bar */}
      <div className="h-1.5 w-20 bg-brandPurple" />

      {/* Main heading */}
      <Heading as="h1" variant="title">
        {title} <span className="text-brandPurple">{highlightedWord}</span>
      </Heading>

      {/* Subtitle */}
      {subtitle && (
        typeof subtitle === "string" ? (
          <Span variant="default" className="opacity-40 tracking-[0.5em]">
            {subtitle}
          </Span>
        ) : (
          <div>{subtitle}</div>
        )
      )}
    </div>
  );
}
