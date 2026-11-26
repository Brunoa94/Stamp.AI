import { ImagePlus, PenLine } from "lucide-react";
import type {
  HeroRotatingWordIdType,
  HeroStartOptionT,
} from "@/features/homepage/lib/types/heroShowcase";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const PROMO = staticAssetUrl("/promo-sections");

/** Products out in the world, for the first ribbon row */
export const HERO_RIBBON_LIFESTYLE: readonly string[] = [
  `${PROMO}/memories/happy-family.webp`,
  `${PROMO}/special-moments/kids-birthday.webp`,
  `${PROMO}/brand-logo/run-club.webp`,
  `${PROMO}/memories/zoe.webp`,
  `${PROMO}/special-moments/bride-party.webp`,
  `${PROMO}/brand-logo/quote-mugs.webp`,
  `${PROMO}/memories/couple.webp`,
  `${PROMO}/special-moments/football-player.webp`,
  `${PROMO}/brand-logo/gym-clothing.webp`,
  `${PROMO}/memories/girlfriend.webp`,
  `${PROMO}/brand-logo/luxury-brand.webp`,
];

const HOME = staticAssetUrl("/home");
const PRODUCTS = staticAssetUrl("/products-images");
// TODO: Restore when inspiration images are uploaded to R2
// const INSPIRATION = `${PRODUCTS}/inspiration`;

/** Finished product shots, for the second ribbon row */
// TODO: Restore inspiration images when uploaded to R2
export const HERO_RIBBON_PRODUCTS: readonly string[] = [
  `${HOME}/1-b.webp`,
  // `${INSPIRATION}/kid-tshirt-drawing.webp`,
  `${PRODUCTS}/tote/tote-b-printed.webp`,
  `${HOME}/4-b.webp`,
  // `${INSPIRATION}/mug-couple-cartoon.webp`,
  `${PRODUCTS}/kid-t-shirt/kid-t-shirt-a-printed.webp`,
  `${HOME}/5-b.webp`,
  // `${INSPIRATION}/tote-botanical.webp`,
  `${PRODUCTS}/tote/tote-c-printed.webp`,
  `${HOME}/2-b.webp`,
  // `${INSPIRATION}/hoodie-pet-portrait.webp`,
  `${PRODUCTS}/kid-t-shirt/kid-t-shirt-b-printed.webp`,
  `${HOME}/6-b.webp`,
  // `${INSPIRATION}/canvas-pet-renaissance.webp`,
  `${PRODUCTS}/tote/tote-a-printed.webp`,
  `${HOME}/3-b.webp`,
];

/**
 * Each list repeated once so a single marquee copy outspans wide screens
 * (the row itself renders that copy twice for the seamless loop)
 */
export const HERO_RIBBON_LIFESTYLE_LOOP: readonly string[] = [
  ...HERO_RIBBON_LIFESTYLE,
  ...HERO_RIBBON_LIFESTYLE,
];

export const HERO_RIBBON_PRODUCTS_LOOP: readonly string[] = [
  ...HERO_RIBBON_PRODUCTS,
  ...HERO_RIBBON_PRODUCTS,
];

/** How long each word stays in "From imagination to ___" */
export const HERO_ROTATING_WORD_INTERVAL_MS = 2200;

/** Headline words in order; the first is what screen readers hear */
export const HERO_ROTATING_WORD_IDS: readonly HeroRotatingWordIdType[] = [
  "tees",
  "totes",
  "mugs",
  "hoodies",
];

/** The hero card's two ways into the creator, in toggle order; the first is selected */
export const HERO_START_OPTIONS: readonly HeroStartOptionT[] = [
  { id: "upload", icon: ImagePlus },
  { id: "describe", icon: PenLine },
];
