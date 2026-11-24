/**
 * HomeFaqSection
 *
 * Two-column FAQ: the section header and a contact button on the left, an
 * accordion of Disclosure cards on the right. Its questions back the page's FAQPage
 * structured data, so they must stay visible on the homepage.
 */

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Disclosure } from "@/features/ui/disclosure";
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
            <Disclosure key={faq.id} title={t(`items.${faq.id}.question`)}>
              <Paragraph variant="xs" className="text-(--color-stamp-taupe) md:text-lg">
                {t(`items.${faq.id}.answer`)}
              </Paragraph>
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
