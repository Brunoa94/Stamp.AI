import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Disclosure } from "@/features/ui/disclosure";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";
import { PageHeader } from "@/shared/ui/PageHeader";
import { FAQ_CATEGORIES } from "../lib/constants/faqContent";

/**
 * FaqPageContent
 *
 * Standalone FAQ page: the cream page header, then one row per category
 * (its heading on the left, an accordion of Disclosure cards on the right),
 * matching the homepage FAQ section. Ends with a contact panel.
 */

export function FaqPageContent() {
  const t = useTranslations("faq");

  return (
    <article className="px-4 pt-28 pb-20 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-screen-2xl">
        <PageHeader title={t("title")} highlightedWord={t("accent")} subtitle={t("intro")} />

        <div className="mt-16 space-y-16">
          {FAQ_CATEGORIES.map((category) => (
            <section
              key={category.id}
              aria-labelledby={`faq-${category.id}-title`}
              className="grid gap-6 lg:grid-cols-3 lg:gap-16"
            >
              <Heading
                as="h2"
                id={`faq-${category.id}-title`}
                variant="sectionSlab"
                className="text-(--color-stamp-chocolate) lg:sticky lg:top-28 lg:self-start"
              >
                {t(`categories.${category.id}.heading`)}
              </Heading>
              <div className="space-y-3 lg:col-span-2">
                {category.items.map((itemId) => (
                  <Disclosure key={itemId} title={t(`items.${itemId}.question`)}>
                    <Paragraph variant="xs" className="text-(--color-stamp-taupe) md:text-lg">
                      {t(`items.${itemId}.answer`)}
                    </Paragraph>
                  </Disclosure>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-20 flex flex-col items-start gap-6 rounded-2xl bg-(--color-stamp-cream) px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
          <Paragraph variant="sm" className="text-(--color-stamp-chocolate)">
            {t("stillHaveQuestions")}
          </Paragraph>
          <Button asChild variant="primary">
            <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>{t("contactSupport")}</a>
          </Button>
        </aside>
      </div>
    </article>
  );
}
