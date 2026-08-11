/**
 * HomeFaqSection
 *
 * FAQ accordion built on native <details>/<summary> (keyboard accessible,
 * zero JS) with a contact support CTA.
 */

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { HOME_FAQS } from "../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { SectionReveal } from "../components/SectionReveal";

export function HomeFaqSection() {
  const t = useTranslations("home.faq");

  return (
    <section id="faq" className="px-6 py-24 lg:px-12 xl:px-24">
      <SectionReveal className="mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
        />

        <div className="space-y-4">
          {HOME_FAQS.map((faq) => (
            <details
              key={faq.id}
              className="group border border-(--color-stamp-divider) bg-(--color-stamp-white) transition-colors duration-300 open:border-(--color-stamp-gold) hover:border-(--color-stamp-gold)"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 lg:p-8 [&::-webkit-details-marker]:hidden">
                <Heading as="h3" variant="question">
                  {t(`items.${faq.id}.question`)}
                </Heading>
                <ChevronRight
                  aria-hidden
                  className="h-5 w-5 flex-none text-(--color-stamp-taupe) transition-transform duration-300 group-open:rotate-90 group-open:text-(--color-stamp-gold)"
                />
              </summary>
              <div className="border-t border-(--color-stamp-divider) p-6 lg:p-8">
                <Paragraph variant="faq" className="text-(--color-stamp-taupe)">
                  {t(`items.${faq.id}.answer`)}
                </Paragraph>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
          <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
            {t("stillHaveQuestions")}
          </Paragraph>
          <Button asChild variant="primary">
            <Link href="/stamp">{t("faqCta")}</Link>
          </Button>
        </div>
      </SectionReveal>
    </section>
  );
}
