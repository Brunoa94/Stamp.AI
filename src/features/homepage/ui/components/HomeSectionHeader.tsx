/**
 * HomeSectionHeader
 *
 * Luxury section header: gold accent bar, Anton title with an optional
 * serif-italic accent word, and a wide-tracked taupe label.
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface HomeSectionHeaderPropsI {
  title: string;
  accent?: string;
  label: string;
  inverted?: boolean;
  className?: string;
}

export function HomeSectionHeader({
  title,
  accent,
  label,
  inverted = false,
  className,
}: HomeSectionHeaderPropsI) {
  return (
    <header className={cn("mb-16 space-y-4", className)}>
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading
        as="h2"
        variant="sectionDisplay"
        className={
          inverted
            ? "text-(--color-stamp-off-white)"
            : "text-(--color-stamp-chocolate)"
        }
      >
        {title}
        {accent && (
          <>
            {" "}
            <Span
              variant="serif"
              className={
                inverted
                  ? "text-(--color-stamp-gold)"
                  : "text-(--color-stamp-taupe)"
              }
            >
              {accent}
            </Span>
          </>
        )}
      </Heading>
    </header>
  );
}
