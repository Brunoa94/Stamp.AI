/**
 * HomeTrustGuaranteesSection
 *
 * Trust & payment section with guarantee cards and secure payment badges.
 * Positioned between Process and Manifesto sections.
 */

import { useTranslations } from "next-intl";
import { HomeSectionHeader } from "../components/HomeSectionHeader";
import { SectionReveal } from "../components/SectionReveal";
import { TrustGuaranteesGrid } from "../components/TrustGuarantees/TrustGuaranteesGrid";
import { HomePaymentMethods } from "../components/HomePaymentMethods";

export function HomeTrustGuaranteesSection() {
  const t = useTranslations("home.guarantees");

  return (
    <section className="bg-(--color-stamp-off-white) px-6 py-24 lg:px-12 xl:px-24">
      <SectionReveal className="mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
        />

        <TrustGuaranteesGrid />
        <HomePaymentMethods />
      </SectionReveal>
    </section>
  );
}
