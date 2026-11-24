import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { PageHeader } from "@/shared/ui/PageHeader";
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
 * h-24 header with top padding but renders no chrome of its own. Uses the
 * shared cream PageHeader, a readable max-w-4xl text column inside the
 * page gutter, and a cream contact panel at the end.
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
    <article className="px-4 pt-28 pb-20 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-screen-2xl">
        <PageHeader
          title={t("title")}
          highlightedWord={t("accent")}
          subtitle={t("intro", LEGAL_ENTITY)}
        >
          <Span as="p" variant="label" className="text-(--color-stamp-gold-text)">
            {tCommon("updated")}: {LEGAL_LAST_UPDATED}
          </Span>
        </PageHeader>

        <div className="mt-16 max-w-4xl space-y-12">
          {sections.map((section) => (
            <LegalSection key={section.id} section={section} />
          ))}
        </div>

        <aside className="mt-20 max-w-4xl space-y-4 rounded-2xl bg-(--color-stamp-cream) px-6 py-10 sm:px-10">
          <Heading
            as="h2"
            variant="question"
            className="text-(--color-stamp-chocolate)"
          >
            {tCommon("questionsHeading")}
          </Heading>
          <Paragraph variant="xs" className="text-(--color-stamp-taupe) md:text-lg">
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
