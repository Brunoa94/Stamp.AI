/**
 * StoryBlockContent
 *
 * Renders the text content for a story block: eyebrow, title, body, and CTA link.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface StoryBlockContentProps {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  cta: string;
  href: string;
}

export function StoryBlockContent({
  eyebrow,
  title,
  body,
  cta,
  href,
}: StoryBlockContentProps) {
  return (
    <div className="flex-1 text-center md:text-left">
      <div className="mb-4 flex items-center justify-center gap-3 md:justify-start">
        <div className="h-1 w-8 bg-(--color-stamp-gold)" />
        <Span
          variant="micro"
          className="uppercase tracking-widest text-(--color-stamp-taupe)"
        >
          {eyebrow}
        </Span>
      </div>

      <Heading
        as="h2"
        variant="card"
        className="mb-4 text-2xl text-(--color-stamp-chocolate) md:text-3xl lg:text-4xl"
      >
        {title}
      </Heading>

      <Paragraph
        variant="sm"
        className="mb-6 max-w-lg text-(--color-stamp-taupe)"
      >
        {body}
      </Paragraph>

      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-(--color-stamp-chocolate) transition-colors duration-300 hover:text-(--color-stamp-gold)"
      >
        <Span variant="default">{cta}</Span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
