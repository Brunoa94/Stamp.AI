/**
 * StoryBlockContent
 *
 * Renders the text content for a story block in the homepage section-header
 * order: amber accent bar, eyebrow, title with a handwritten accent, body,
 * and an uppercase CTA link.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface StoryBlockContentProps {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  cta: string;
  href: string;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
}

export function StoryBlockContent({
  eyebrow,
  title,
  body,
  cta,
  href,
  inverted = false,
}: StoryBlockContentProps) {
  return (
    <div className="flex max-w-2xl flex-1 flex-col items-center gap-3 text-center md:items-start md:text-left">
      <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
      <Span
        as="p"
        variant="label"
        className={inverted ? "text-(--color-stamp-gold-light)" : "text-(--color-stamp-gold-text)"}
      >
        {eyebrow}
      </Span>

      <Heading
        as="h2"
        variant="sectionDisplay"
        className={cn(
          "max-w-2xl",
          inverted ? "text-(--color-stamp-off-white)" : "text-(--color-stamp-chocolate)"
        )}
      >
        {title}
      </Heading>

      <Paragraph
        variant="xs"
        className={cn(
          "mt-2 max-w-xl md:text-lg",
          inverted ? "text-(--color-stamp-taupe-light)" : "text-(--color-stamp-taupe)"
        )}
      >
        {body}
      </Paragraph>

      <Link
        href={href}
        className={cn(
          "group mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4",
          inverted
            ? "text-(--color-stamp-gold-light) hover:text-(--color-stamp-off-white) focus-visible:outline-(--color-stamp-off-white)"
            : "text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold-text) focus-visible:outline-(--color-stamp-chocolate)"
        )}
      >
        {cta}
        <ArrowRight aria-hidden className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
