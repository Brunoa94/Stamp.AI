import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { List } from "@/features/ui/list";
import type { LegalSectionType } from "../types/legal";

/**
 * LegalSection
 *
 * One numbered section of a legal document: heading, body paragraphs,
 * and an optional bullet list with a gold square marker.
 */

interface PropsI {
  section: LegalSectionType;
}

export function LegalSection({ section }: PropsI) {
  return (
    <section className="space-y-4">
      <Heading
        as="h2"
        variant="item"
        className="text-(--color-stamp-chocolate)"
      >
        {section.heading}
      </Heading>
      {section.body.map((paragraph) => (
        <Paragraph
          key={paragraph}
          variant="loose"
          className="text-(--color-stamp-chocolate)/70"
        >
          {paragraph}
        </Paragraph>
      ))}
      {section.bullets && (
        <List className="space-y-3 pt-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-4">
              <span
                aria-hidden
                className="mt-3 h-1.5 w-1.5 flex-none bg-(--color-stamp-gold)"
              />
              <Paragraph
                as="span"
                variant="loose"
                className="text-(--color-stamp-chocolate)/70"
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
