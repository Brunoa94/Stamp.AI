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
    <section className="relative bg-(--color-stamp-off-white) px-6 py-24 lg:px-12 xl:px-24 lg:py-32 overflow-hidden">
      {/* Decorative gold accent lines */}
      <div className="absolute top-12 left-6 lg:left-12 xl:left-24 w-32 h-1 bg-(--color-stamp-gold)/40 rounded-full" aria-hidden="true" />
      <div className="absolute top-12 right-6 lg:right-12 xl:right-24 w-32 h-1 bg-(--color-stamp-gold)/40 rounded-full" aria-hidden="true" />

      {/* Decorative corner frames */}
      <div className="absolute top-8 left-6 lg:left-12 xl:left-24 w-16 h-16 border-t-2 border-l-2 border-(--color-stamp-gold)/25 rounded-tl-lg" aria-hidden="true" />
      <div className="absolute top-8 right-6 lg:right-12 xl:right-24 w-16 h-16 border-t-2 border-r-2 border-(--color-stamp-gold)/25 rounded-tr-lg" aria-hidden="true" />

      <SectionReveal className="relative mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
          className="mb-16"
        />

        <TrustGuaranteesGrid />
        <HomePaymentMethods />
      </SectionReveal>
    </section>
  );
}
