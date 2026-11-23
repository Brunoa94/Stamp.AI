/**
 * HomeFaqSection
 *
 * Two-column FAQ: the section header and a contact button on the left, an
 * accordion of rounded cards on the right. Built on native <details>/<summary>
 * (keyboard accessible, zero JS). Its questions back the page's FAQPage
 * structured data, so they must stay visible on the homepage.
 */

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { LEGAL_ENTITY } from "@/features/legal/lib/constants/legalEntity";
import { HOME_FAQS } from "../../../lib/constants/homepageContent";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";

export function HomeFaqSection() {
  const t = useTranslations("home.faq");

  return (
    <section id="faq" aria-labelledby="home-faq-title" className="scroll-mt-28 px-4 py-20 sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-screen-2xl gap-10 lg:grid-cols-3 lg:gap-16">
        <div className="space-y-6">
          <HomeSectionHeader
            id="home-faq-title"
            label={t("label")}
            title={t("title")}
            accent={t("accent")}
            subtitle={t("stillHaveQuestions")}
          />
          <Button asChild variant="secondary-compact">
            <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>{t("contactSupport")}</a>
          </Button>
        </div>

        <div className="space-y-3 lg:col-span-2">
          {HOME_FAQS.map((faq) => (
            <details
              key={faq.id}
              className="group rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) px-5 shadow-(--shadow-stamp-card) transition-colors open:border-(--color-stamp-gold) hover:border-(--color-stamp-gold) lg:px-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-xl py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) [&::-webkit-details-marker]:hidden">
                <Heading as="h3" variant="faqQuestion" className="text-lg font-medium text-(--color-stamp-chocolate) md:text-xl">
                  {t(`items.${faq.id}.question`)}
                </Heading>
                <Plus
                  aria-hidden
                  className="size-5 flex-none text-(--color-stamp-taupe) transition-transform duration-200 group-open:rotate-45 group-open:text-(--color-stamp-gold-text)"
                />
              </summary>
              <Paragraph variant="xs" className="pb-6 text-(--color-stamp-taupe) md:text-lg">
                {t(`items.${faq.id}.answer`)}
              </Paragraph>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
