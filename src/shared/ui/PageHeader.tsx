/**
 * PageHeader
 *
 * Page header for text pages without a photo band (FAQ, legal): a
 * `rounded-2xl` cream panel holding the page `h1` in the section-header
 * order — an amber accent bar, the sentence-case slab-serif title with a
 * handwritten accent word, and an optional supporting line. `children`
 * renders under the subtitle (e.g. a "last updated" note). Place it inside
 * the page gutter (px-4 sm:px-6 lg:px-12, max-w-screen-2xl).
 */

import { ReactNode } from "react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PropsI {
  /** Main title text before the highlighted word */
  title: string;
  /** Handwritten accent word after the title */
  highlightedWord: string;
  /** Optional supporting line under the title */
  subtitle?: string | ReactNode;
  /** Optional content under the subtitle */
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  highlightedWord,
  subtitle,
  children,
  className,
}: PropsI) {
  return (
    <header
      className={cn(
        "rounded-2xl bg-(--color-stamp-cream) px-6 py-12 sm:px-10 lg:px-14 xl:py-16",
        className,
      )}
    >
      <div className="max-w-4xl space-y-4">
        <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />

        <Heading as="h1" variant="title" className="text-(--color-stamp-chocolate)">
          {title}{" "}
          <Span variant="serif" className="text-(--color-stamp-gold-text)">
            {highlightedWord}
          </Span>
        </Heading>

        {subtitle &&
          (typeof subtitle === "string" ? (
            <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
              {subtitle}
            </Paragraph>
          ) : (
            <div>{subtitle}</div>
          ))}

        {children}
      </div>
    </header>
  );
}
