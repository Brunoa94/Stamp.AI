/**
 * HomeSectionHeader
 *
 * Luxury section header: gold accent bar, Anton title with an optional
 * serif-italic accent word, and a wide-tracked taupe label.
 */

import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface HomeSectionHeaderPropsI {
  title: string;
  accent?: string;
  label: string;
  subtitle?: string;
  inverted?: boolean;
  className?: string;
}

export function HomeSectionHeader({
  title,
  accent,
  label: _label,
  subtitle,
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
      {subtitle && (
        <Paragraph
          variant="sm"
          className={cn(
            "max-w-2xl",
            inverted
              ? "text-(--color-stamp-off-white)/70"
              : "text-(--color-stamp-taupe)"
          )}
        >
          {subtitle}
        </Paragraph>
      )}
    </header>
  );
}
