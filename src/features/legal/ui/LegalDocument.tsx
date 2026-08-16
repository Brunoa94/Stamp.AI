import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { LegalSection } from "./LegalSection";
import { LEGAL_ENTITY } from "../lib/constants/legalEntity";
import {
  LEGAL_LAST_UPDATED,
  type LegalPageKeyType,
} from "../lib/constants/legalPages";
import type { LegalSectionMessagesType, LegalSectionType } from "../types/legal";

/**
 * LegalDocument
 *
 * Shared renderer for all legal/policy pages (terms, privacy, cookies,
 * security, shipping, returns). Section order and copy come from the
 * `legal.<pageKey>` message namespace; entity details ({legalName},
 * {supportEmail}, …) are interpolated from LEGAL_ENTITY.
 *
 * Rendered inside AppLayoutChrome's <main>, so it accounts for the fixed
 * h-24 header with top padding but renders no chrome of its own.
 */

interface PropsI {
  pageKey: LegalPageKeyType;
}

export function LegalDocument({ pageKey }: PropsI) {
  const t = useTranslations(`legal.${pageKey}`);
  const tCommon = useTranslations("legal.common");

  const rawSections = t.raw("sections") as Record<
    string,
    LegalSectionMessagesType
  >;

  // JSON key order is the authored document order. ICU placeholders are
  // resolved per string via indexed t() calls (t.raw skips formatting).
  const sections: LegalSectionType[] = Object.entries(rawSections).map(
    ([id, raw]) => ({
      id,
      heading: t(`sections.${id}.heading`, LEGAL_ENTITY),
      body: raw.body.map((_, i) =>
        t(`sections.${id}.body.${i}`, LEGAL_ENTITY)
      ),
      bullets: raw.bullets?.map((_, i) =>
        t(`sections.${id}.bullets.${i}`, LEGAL_ENTITY)
      ),
    })
  );

  return (
    <article className="px-6 pt-40 pb-24 lg:px-12 xl:px-24">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 space-y-4">
          <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
          <Heading
            as="h1"
            variant="sectionDisplay"
            className="text-(--color-stamp-chocolate)"
          >
            {t("title")}{" "}
            <Span variant="serif" className="text-(--color-stamp-taupe)">
              {t("accent")}
            </Span>
          </Heading>
          <Span variant="label" className="block text-(--color-stamp-taupe)">
            {tCommon("updated")}: {LEGAL_LAST_UPDATED}
          </Span>
        </header>

        <Paragraph
          variant="lead"
          className="mb-16 text-(--color-stamp-chocolate)/80"
        >
          {t("intro", LEGAL_ENTITY)}
        </Paragraph>

        <div className="space-y-12">
          {sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}
        </div>

        <aside className="mt-20 space-y-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream) p-8">
          <Heading
            as="h2"
            variant="question"
            className="text-(--color-stamp-chocolate)"
          >
            {tCommon("questionsHeading")}
          </Heading>
          <Paragraph variant="sm" className="text-(--color-stamp-chocolate)/70">
            {tCommon("questionsBody")}
          </Paragraph>
          <Button asChild variant="secondary">
            <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
              {tCommon("questionsCta")}
            </a>
          </Button>
        </aside>
      </div>
    </article>
  );
}
