import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";
import { FAQ_CATEGORIES } from "../lib/constants/faqContent";

/**
 * FaqPageContent
 *
 * Standalone FAQ page: categorised accordions built on native
 * <details>/<summary> (keyboard accessible, zero JS), mirroring the
 * homepage FAQ section's markup, plus a contact CTA.
 */

export function FaqPageContent() {
  const t = useTranslations("faq");

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
        </header>

        <Paragraph
          variant="lead"
          className="mb-16 text-(--color-stamp-chocolate)/80"
        >
          {t("intro")}
        </Paragraph>

        <div className="space-y-16">
          {FAQ_CATEGORIES.map((category) => (
            <section key={category.id} className="space-y-6">
              <Heading
                as="h2"
                variant="item"
                className="text-(--color-stamp-chocolate)"
              >
                {t(`categories.${category.id}.heading`)}
              </Heading>
              <div className="space-y-4">
                {category.items.map((itemId) => (
                  <details
                    key={itemId}
                    className="group border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-colors duration-300 open:border-(--color-stamp-gold) hover:border-(--color-stamp-gold)"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 [&::-webkit-details-marker]:hidden">
                      <Heading as="h3" variant="itemCompact">
                        {t(`items.${itemId}.question`)}
                      </Heading>
                      <ChevronRight
                        aria-hidden
                        className="h-5 w-5 flex-none text-(--color-stamp-taupe) transition-transform duration-300 group-open:rotate-90 group-open:text-(--color-stamp-gold)"
                      />
                    </summary>
                    <div className="border-t border-(--color-stamp-divider) p-6">
                      <Paragraph
                        variant="faq"
                        className="text-(--color-stamp-taupe)"
                      >
                        {t(`items.${itemId}.answer`)}
                      </Paragraph>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("stillHaveQuestions")}
          </Paragraph>
          <Button asChild variant="primary">
            <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>
              {t("contactSupport")}
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
