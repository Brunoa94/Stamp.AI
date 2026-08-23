/**
 * StoryBlockContent
 *
 * Renders the text content for a story block: eyebrow, title, body, and CTA link.
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
    <div className="flex-1 text-center md:text-left">
      <Heading
        as="h2"
        variant="card"
        className={cn(
          "mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl",
          inverted ? "text-(--color-stamp-off-white)" : "text-(--color-stamp-chocolate)"
        )}
      >
        {title}
      </Heading>

      <Paragraph
        variant="default"
        className={cn(
          "mb-8 max-w-xl text-base md:text-lg lg:text-xl leading-relaxed",
          inverted ? "text-(--color-stamp-taupe)" : "text-(--color-stamp-taupe)"
        )}
      >
        {body}
      </Paragraph>

      <Link
        href={href}
        className={cn(
          "group inline-flex items-center gap-3 text-base md:text-lg font-medium transition-colors duration-300",
          inverted
            ? "text-(--color-stamp-gold) hover:text-(--color-stamp-off-white)"
            : "text-(--color-stamp-chocolate) hover:text-(--color-stamp-gold)"
        )}
      >
        <Span variant="default">{cta}</Span>
        <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
