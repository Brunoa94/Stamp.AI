import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import type { LegalSectionType } from "../types/legal";

/**
 * LegalSection
 *
 * One numbered section of a legal document: heading, body paragraphs,
 * and an optional bullet list with an amber dot marker.
 */

interface PropsI {
  section: LegalSectionType;
}

export function LegalSection({ section }: PropsI) {
  return (
    <section className="space-y-4">
      <Heading
        as="h2"
        variant="cardCompact"
        className="text-2xl text-(--color-stamp-chocolate)"
      >
        {section.heading}
      </Heading>
      {section.body.map((paragraph) => (
        <Paragraph
          key={paragraph}
          variant="xs"
          className="text-(--color-stamp-taupe) md:text-lg"
        >
          {paragraph}
        </Paragraph>
      ))}
      {section.bullets && (
        <List className="space-y-2 pt-1">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-4">
              <Span
                unstyled
                aria-hidden
                className="mt-2.5 size-1.5 flex-none rounded-full bg-(--color-stamp-gold) md:mt-3"
              />
              <Paragraph
                as="span"
                variant="xs"
                className="text-(--color-stamp-taupe) md:text-lg"
              >
                {bullet}
              </Paragraph>
            </li>
          ))}
        </List>
      )}
    </section>
  );
}
