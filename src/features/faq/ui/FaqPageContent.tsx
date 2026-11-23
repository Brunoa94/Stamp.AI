import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";
import { PageHeader } from "@/shared/ui/PageHeader";
import { FAQ_CATEGORIES } from "../lib/constants/faqContent";

/**
 * FaqPageContent
 *
 * Standalone FAQ page: the cream page header, then one row per category
 * (its heading on the left, an accordion of rounded cards on the right),
 * matching the homepage FAQ section. Accordions are native
 * <details>/<summary> (keyboard accessible, zero JS). Ends with a
 * contact panel.
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
                  <details
                    key={itemId}
                    className="group rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) px-5 shadow-(--shadow-stamp-card) transition-colors open:border-(--color-stamp-gold) hover:border-(--color-stamp-gold) lg:px-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-xl py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) [&::-webkit-details-marker]:hidden">
                      <Heading
                        as="h3"
                        variant="faqQuestion"
                        className="text-lg font-medium text-(--color-stamp-chocolate) md:text-xl"
                      >
                        {t(`items.${itemId}.question`)}
                      </Heading>
                      <Plus
                        aria-hidden
                        className="size-5 flex-none text-(--color-stamp-taupe) transition-transform duration-200 group-open:rotate-45 group-open:text-(--color-stamp-gold-text)"
                      />
                    </summary>
                    <Paragraph variant="xs" className="pb-6 text-(--color-stamp-taupe) md:text-lg">
                      {t(`items.${itemId}.answer`)}
                    </Paragraph>
                  </details>
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
