import { Eye, PackageCheck, WandSparkles } from "lucide-react";
import type {
  HeroFlowBenefitType,
  HeroRotatingWordIdType,
} from "@/features/homepage/lib/types/heroShowcase";

/** Products out in the world, for the first ribbon row */
export const HERO_RIBBON_LIFESTYLE: readonly string[] = [
  "/promo-sections/memories/happy-family.png",
  "/promo-sections/special-moments/kids-birthday.png",
  "/promo-sections/brand-logo/run-club.png",
  "/promo-sections/memories/zoe.png",
  "/promo-sections/special-moments/bride-party.png",
  "/promo-sections/brand-logo/quote-mugs.png",
  "/promo-sections/memories/couple.png",
  "/promo-sections/special-moments/football-player.png",
  "/promo-sections/brand-logo/gym-clothing.png",
  "/promo-sections/memories/girlfriend.png",
  "/promo-sections/brand-logo/luxury-brand.png",
];

/** Finished product shots, for the second ribbon row */
export const HERO_RIBBON_PRODUCTS: readonly string[] = [
  "/home/1-b.png",
  "/products-images/tote/tote-b-printed.png",
  "/home/4-b.png",
  "/products-images/kid t-shirt/kid-t-shirt-a-printed.png",
  "/home/5-b.png",
  "/products-images/tote/tote-c-printed.png",
  "/home/2-b.png",
  "/products-images/kid t-shirt/kid-t-shirt-b-printed.png",
  "/home/6-b.png",
  "/products-images/tote/tote-a-printed.png",
  "/home/3-b.png",
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
  "thing",
  "tees",
  "totes",
  "mugs",
  "hoodies",
];

/** Banners under the flow demo: what the eight steps spare the visitor */
export const HERO_FLOW_BENEFITS: readonly HeroFlowBenefitType[] = [
  { id: "noSkills", icon: WandSparkles },
  { id: "preview", icon: Eye },
  { id: "onDemand", icon: PackageCheck },
];
