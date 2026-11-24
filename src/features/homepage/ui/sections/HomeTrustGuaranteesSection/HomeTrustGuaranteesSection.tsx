/**
 * HomeTrustGuaranteesSection
 *
 * Trust & payment section with guarantee cards and secure payment badges.
 * Positioned between Process and Manifesto sections.
 */

import { useTranslations } from "next-intl";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";
import { SectionReveal } from "../../components/SectionReveal";
import { TrustGuaranteesGrid } from "./TrustGuaranteesGrid";
import { HomePaymentMethods } from "./HomePaymentMethods";

export function HomeTrustGuaranteesSection() {
  const t = useTranslations("home.guarantees");

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-12">
      <SectionReveal className="relative mx-auto max-w-screen-2xl" parallax fadeOnScroll>
        <HomeSectionHeader
          title={t("title")}
          accent={t("accent")}
          label={t("label")}
          className="mb-10"
        />

        <TrustGuaranteesGrid />
        <HomePaymentMethods />
      </SectionReveal>
    </section>
  );
}
