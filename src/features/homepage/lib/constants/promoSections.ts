/**
 * Promotional Sections Configuration
 *
 * Defines content and images for the 3 promotional carousel sections
 * on the homepage: Brand & Logo, Memories, and Special Moments.
 */

import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const PROMO = staticAssetUrl("/promo-sections");

export interface PromoImageType {
  src: string;
  alt: string;
}

/** Animation timing */
export const PROMO_CAROUSEL_DISPLAY_MS = 3500;

/** Brand & Logo section images */
export const PROMO_BRAND_LOGO_IMAGES: PromoImageType[] = [
  {
    src: `${PROMO}/brand-logo/gym-clothing.png`,
    alt: "Custom gym clothing logo on apparel",
  },
  {
    src: `${PROMO}/brand-logo/luxury-brand.png`,
    alt: "Luxury brand logo merchandise",
  },
  {
    src: `${PROMO}/brand-logo/quote-mugs.png`,
    alt: "Custom quote design on mug",
  },
  {
    src: `${PROMO}/brand-logo/run-club.png`,
    alt: "Run club logo on merchandise",
  },
];

/** Memories section images */
export const PROMO_MEMORIES_IMAGES: PromoImageType[] = [
  {
    src: `${PROMO}/memories/couple.png`,
    alt: "Couple photo turned into custom merchandise",
  },
  {
    src: `${PROMO}/memories/girlfriend.png`,
    alt: "Personal photo on custom product",
  },
  {
    src: `${PROMO}/memories/happy-family.png`,
    alt: "Family photo on personalized merchandise",
  },
  {
    src: `${PROMO}/memories/zoe.png`,
    alt: "Pet photo on custom product",
  },
];

/** Special Moments section images */
export const PROMO_SPECIAL_MOMENTS_IMAGES: PromoImageType[] = [
  {
    src: `${PROMO}/special-moments/bride-party.png`,
    alt: "Bride party custom merchandise",
  },
  {
    src: `${PROMO}/special-moments/football-player.png`,
    alt: "Football player celebration merchandise",
  },
  {
    src: `${PROMO}/special-moments/kids-birthday.png`,
    alt: "Kids birthday party custom product",
  },
];
