/**
 * Promotional Sections Configuration
 *
 * Defines content and images for the 3 promotional carousel sections
 * on the homepage: Brand & Logo, Memories, and Special Moments.
 */

export interface PromoImageType {
  src: string;
  alt: string;
}

/** Animation timing (mirrors HeroTransformShowcase) */
export const PROMO_CAROUSEL_DISPLAY_MS = 3500;

/** Brand & Logo section images */
export const PROMO_BRAND_LOGO_IMAGES: PromoImageType[] = [
  {
    src: "/promo-sections/brand-logo/gym-clothing.png",
    alt: "Custom gym clothing logo on apparel",
  },
  {
    src: "/promo-sections/brand-logo/luxury-brand.png",
    alt: "Luxury brand logo merchandise",
  },
  {
    src: "/promo-sections/brand-logo/quote-mugs.png",
    alt: "Custom quote design on mug",
  },
  {
    src: "/promo-sections/brand-logo/run-club.png",
    alt: "Run club logo on merchandise",
  },
];

/** Memories section images */
export const PROMO_MEMORIES_IMAGES: PromoImageType[] = [
  {
    src: "/promo-sections/memories/couple.png",
    alt: "Couple photo turned into custom merchandise",
  },
  {
    src: "/promo-sections/memories/girlfriend.png",
    alt: "Personal photo on custom product",
  },
  {
    src: "/promo-sections/memories/happy-family.png",
    alt: "Family photo on personalized merchandise",
  },
  {
    src: "/promo-sections/memories/zoe.png",
    alt: "Pet photo on custom product",
  },
];

/** Special Moments section images */
export const PROMO_SPECIAL_MOMENTS_IMAGES: PromoImageType[] = [
  {
    src: "/promo-sections/special-moments/bride-party.png",
    alt: "Bride party custom merchandise",
  },
  {
    src: "/promo-sections/special-moments/football-player.png",
    alt: "Football player celebration merchandise",
  },
  {
    src: "/promo-sections/special-moments/kids-birthday.png",
    alt: "Kids birthday party custom product",
  },
];
