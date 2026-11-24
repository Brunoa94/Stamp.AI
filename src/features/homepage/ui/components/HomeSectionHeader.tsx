/**
 * HomeSectionHeader
 *
 * The one section header every homepage section uses: an amber accent bar,
 * an uppercase eyebrow, a sentence-case slab-serif title with an optional
 * handwritten accent word, an optional supporting line, and an optional
 * action (usually a "browse all" link) aligned right on wider screens.
 * `inverted` is for chocolate sections.
 */

import type { ReactNode } from "react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PropsI {
  id?: string;
  title: string;
  accent?: string;
  label?: string;
  subtitle?: string;
  action?: ReactNode;
  inverted?: boolean;
  className?: string;
}

export function HomeSectionHeader({
  id,
  title,
  accent,
  label,
  subtitle,
  action,
  inverted = false,
  className,
}: PropsI) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        {label && (
          <Span
            as="p"
            variant="label"
            className={inverted ? "text-(--color-stamp-gold-light)" : "text-(--color-stamp-gold-text)"}
          >
            {label}
          </Span>
        )}
        <Heading
          as="h2"
          id={id}
          variant="sectionDisplay"
          className={inverted ? "text-(--color-stamp-off-white)" : "text-(--color-stamp-chocolate)"}
        >
          {title}
          {accent && (
            <>
              {" "}
              <Span
                variant="serif"
                className={inverted ? "text-(--color-stamp-gold-light)" : "text-(--color-stamp-gold-text)"}
              >
                {accent}
              </Span>
            </>
          )}
        </Heading>
        {subtitle && (
          <Paragraph
            variant="xs"
            className={cn(
              "md:text-lg",
              inverted ? "text-(--color-stamp-taupe-light)" : "text-(--color-stamp-taupe)",
            )}
          >
            {subtitle}
          </Paragraph>
        )}
      </div>
      {action}
    </header>
  );
}
