"use client";

/**
 * HomePromoSection
 *
 * Configurable promotional section with image grid carousel.
 * Supports three variants: brand-logo, memories, special-moments.
 * Features luxury styling with decorative accents and bold typography.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionReveal } from "../components/SectionReveal";
import { PromoCarousel } from "../components/PromoSection/PromoCarousel";
import { PromoSectionContent } from "../components/PromoSection/PromoSectionContent";
import {
  PROMO_BRAND_LOGO_IMAGES,
  PROMO_MEMORIES_IMAGES,
  PROMO_SPECIAL_MOMENTS_IMAGES,
} from "../../lib/constants/promoSections";
import type { PromoImageType } from "../../lib/constants/promoSections";

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
    <section
      className={cn(
        "relative px-6 py-20 lg:px-12 xl:px-24 lg:py-28 overflow-hidden",
        background === "chocolate"
          ? "bg-(--color-stamp-chocolate)"
          : background === "white"
            ? "bg-(--color-stamp-white)"
            : "bg-(--color-stamp-cream)",
      )}
    >
      {/* Decorative corner frames for dark background */}
      {isDark && (
        <>
          <div className="absolute top-8 left-6 lg:left-12 xl:left-24 w-20 h-20 border-t-2 border-l-2 border-(--color-stamp-gold)/30 rounded-tl-lg" aria-hidden="true" />
          <div className="absolute top-8 right-6 lg:right-12 xl:right-24 w-20 h-20 border-t-2 border-r-2 border-(--color-stamp-gold)/30 rounded-tr-lg" aria-hidden="true" />
          <div className="absolute bottom-8 left-6 lg:left-12 xl:left-24 w-20 h-20 border-b-2 border-l-2 border-(--color-stamp-gold)/30 rounded-bl-lg" aria-hidden="true" />
          <div className="absolute bottom-8 right-6 lg:right-12 xl:right-24 w-20 h-20 border-b-2 border-r-2 border-(--color-stamp-gold)/30 rounded-br-lg" aria-hidden="true" />
        </>
      )}

      {/* Decorative gold accent line */}
      <div
        className={cn(
          "absolute top-16 w-24 h-1 bg-(--color-stamp-gold)/60 rounded-full",
          contentPosition === "left" ? "left-6 lg:left-12 xl:left-24" : "right-6 lg:right-12 xl:right-24",
        )}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <SectionReveal fadeOnScroll>
          <div
            className={cn(
              "flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-12 xl:gap-16",
              contentPosition === "right" && "lg:flex-row-reverse",
            )}
          >
            {/* Text content */}
            <div className="flex-1 flex flex-col justify-center max-w-xl">
              <PromoSectionContent
                tagline={t(`${variant}.tagline`)}
                accentWord={t(`${variant}.accentWord`)}
                description={t(`${variant}.description`)}
                ctaText={t(`${variant}.cta`)}
                ctaHref="/stamp"
                align={contentPosition === "left" ? "left" : "right"}
                sectionNumber={VARIANT_NUMBERS[variant]}
                inverted={isDark}
              />
            </div>

            {/* Carousel with decorative frame */}
            <div className="w-full max-w-md lg:w-105 shrink-0">
              <div className="relative">
                {/* Gold corner accents */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-(--color-stamp-gold)/50 rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-(--color-stamp-gold)/50 rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-(--color-stamp-gold)/50 rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-(--color-stamp-gold)/50 rounded-br-lg" />

                <PromoCarousel images={images} />
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
