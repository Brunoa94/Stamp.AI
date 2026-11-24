import { Eye, ImagePlus, PackageCheck, PenLine, WandSparkles } from "lucide-react";
import type {
  HeroFlowBenefitType,
  HeroRotatingWordIdType,
  HeroStartOptionT,
} from "@/features/homepage/lib/types/heroShowcase";
import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const PROMO = staticAssetUrl("/promo-sections");

/** Products out in the world, for the first ribbon row */
export const HERO_RIBBON_LIFESTYLE: readonly string[] = [
  `${PROMO}/memories/happy-family.png`,
  `${PROMO}/special-moments/kids-birthday.png`,
  `${PROMO}/brand-logo/run-club.png`,
  `${PROMO}/memories/zoe.png`,
  `${PROMO}/special-moments/bride-party.png`,
  `${PROMO}/brand-logo/quote-mugs.png`,
  `${PROMO}/memories/couple.png`,
  `${PROMO}/special-moments/football-player.png`,
  `${PROMO}/brand-logo/gym-clothing.png`,
  `${PROMO}/memories/girlfriend.png`,
  `${PROMO}/brand-logo/luxury-brand.png`,
];

const HOME = staticAssetUrl("/home");
const PRODUCTS = staticAssetUrl("/products-images");
const INSPIRATION = `${PRODUCTS}/inspiration`;

/** Finished product shots, for the second ribbon row */
export const HERO_RIBBON_PRODUCTS: readonly string[] = [
  `${HOME}/1-b.png`,
  `${INSPIRATION}/kid-tshirt-drawing.webp`,
  `${PRODUCTS}/tote/tote-b-printed.png`,
  `${HOME}/4-b.png`,
  `${INSPIRATION}/mug-couple-cartoon.webp`,
  `${PRODUCTS}/kid-t-shirt/kid-t-shirt-a-printed.png`,
  `${HOME}/5-b.png`,
  `${INSPIRATION}/tote-botanical.webp`,
  `${PRODUCTS}/tote/tote-c-printed.png`,
  `${HOME}/2-b.png`,
  `${INSPIRATION}/hoodie-pet-portrait.webp`,
  `${PRODUCTS}/kid-t-shirt/kid-t-shirt-b-printed.png`,
  `${HOME}/6-b.png`,
  `${INSPIRATION}/canvas-pet-renaissance.webp`,
  `${PRODUCTS}/tote/tote-a-printed.png`,
  `${HOME}/3-b.png`,
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

/** Banners under the flow demo: what the eight steps spare the visitor */
/** The hero card's two ways into the creator, in toggle order; the first is selected */
export const HERO_START_OPTIONS: readonly HeroStartOptionT[] = [
  { id: "upload", icon: ImagePlus },
  { id: "describe", icon: PenLine },
];

export const HERO_FLOW_BENEFITS: readonly HeroFlowBenefitType[] = [
  { id: "noSkills", icon: WandSparkles },
  { id: "preview", icon: Eye },
  { id: "onDemand", icon: PackageCheck },
];
