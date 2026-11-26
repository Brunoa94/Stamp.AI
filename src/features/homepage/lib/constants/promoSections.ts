/**
 * Promotional Sections Configuration
 *
 * Defines content and images for the 2 promotional carousel sections
 * on the homepage: Memories and Special Moments.
 */

import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const PROMO = staticAssetUrl("/promo-sections");

export interface PromoImageType {
  src: string;
  alt: string;
}

/** Animation timing */
export const PROMO_CAROUSEL_DISPLAY_MS = 3500;

/** Memories section images */
export const PROMO_MEMORIES_IMAGES: PromoImageType[] = [
  {
    src: `${PROMO}/memories/couple.webp`,
    alt: "Couple photo turned into custom merchandise",
  },
  {
    src: `${PROMO}/memories/girlfriend.webp`,
    alt: "Personal photo on custom product",
  },
  {
    src: `${PROMO}/memories/happy-family.webp`,
    alt: "Family photo on personalized merchandise",
  },
  {
    src: `${PROMO}/memories/zoe.webp`,
    alt: "Pet photo on custom product",
  },
];

/** Special Moments section images */
export const PROMO_SPECIAL_MOMENTS_IMAGES: PromoImageType[] = [
  {
    src: `${PROMO}/special-moments/bride-party.webp`,
    alt: "Bride party custom merchandise",
  },
  {
    src: `${PROMO}/special-moments/football-player.webp`,
    alt: "Football player celebration merchandise",
  },
  {
    src: `${PROMO}/special-moments/kids-birthday.webp`,
    alt: "Kids birthday party custom product",
  },
];
