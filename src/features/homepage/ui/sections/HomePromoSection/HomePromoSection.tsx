"use client";

/**
 * HomePromoSection
 *
 * Configurable promotional section with image grid carousel, in a rounded
 * panel inside the page gutter (chocolate, cream or white).
 * Supports three variants: brand-logo, memories, special-moments.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { homePanelVariants } from "../../../lib/variants/homePanelVariants";
import { SectionReveal } from "../../components/SectionReveal";
import { PromoCarousel } from "./PromoCarousel";
import { PromoSectionContent } from "./PromoSectionContent";
import {
  PROMO_BRAND_LOGO_IMAGES,
  PROMO_MEMORIES_IMAGES,
  PROMO_SPECIAL_MOMENTS_IMAGES,
} from "../../../lib/constants/promoSections";
import type { PromoImageType } from "../../../lib/constants/promoSections";

type SectionVariant = "brand-logo" | "memories" | "special-moments";

interface PropsI {
  variant: SectionVariant;
  /** Background color variant */
  background?: "cream" | "white" | "chocolate";
  /** Content position relative to carousel */
  contentPosition?: "left" | "right";
}

const VARIANT_IMAGES: Record<SectionVariant, PromoImageType[]> = {
  "brand-logo": PROMO_BRAND_LOGO_IMAGES,
  memories: PROMO_MEMORIES_IMAGES,
  "special-moments": PROMO_SPECIAL_MOMENTS_IMAGES,
};

const VARIANT_NUMBERS: Record<SectionVariant, string> = {
  "brand-logo": "01",
  memories: "02",
  "special-moments": "03",
};

export function HomePromoSection({
  variant,
  background = "cream",
  contentPosition = "left",
}: PropsI) {
  const t = useTranslations("home.promo");
  const images = VARIANT_IMAGES[variant];
  const isDark = background === "chocolate";

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-12">
      <div className={homePanelVariants({ tone: background })}>
        <SectionReveal fadeOnScroll>
          <div
            className={cn(
              "flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24",
              contentPosition === "right" && "lg:flex-row-reverse",
            )}
          >
            {/* Text content */}
            <div className="flex max-w-xl flex-1 flex-col justify-center">
              <PromoSectionContent
                tagline={t(`${variant}.tagline`)}
                accentWord={t(`${variant}.accentWord`)}
                description={t(`${variant}.description`)}
                ctaText={t(`${variant}.cta`)}
                ctaHref="/stamp"
                align="left"
                sectionNumber={VARIANT_NUMBERS[variant]}
                inverted={isDark}
              />
            </div>

            {/* Carousel in a white stamp frame */}
            <div className="w-full max-w-md shrink-0 lg:w-105">
              <PromoCarousel images={images} />
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
