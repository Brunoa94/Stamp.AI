"use client";

/**
 * HomeProductMarqueeSection
 *
 * Chocolate band of product ranges scrolling endlessly, separated by gold
 * sparkles. Decorative, so hidden from assistive tech; holds still for
 * reduced motion.
 */

import { useTranslations } from "next-intl";
import {
  PRODUCT_MARQUEE_DURATION_S,
  PRODUCT_MARQUEE_ITEM_IDS,
  PRODUCT_MARQUEE_REPEATS,
} from "../../lib/constants/productMarquee";
import { HeroRibbonRow } from "../components/HeroSection/HeroRibbonRow";
import { ProductMarqueeItem } from "../components/ProductMarquee/ProductMarqueeItem";

// Labels alternate colour by index; keep this length even so the pattern
// doesn't break where HeroRibbonRow's second copy begins
const MARQUEE_LOOP = Array.from({ length: PRODUCT_MARQUEE_REPEATS }).flatMap(
  () => PRODUCT_MARQUEE_ITEM_IDS,
);

export function HomeProductMarqueeSection() {
  const t = useTranslations("home.productMarquee.items");

  return (
    <section
      aria-hidden="true"
      className="product-marquee overflow-hidden bg-(--color-stamp-chocolate) py-6 md:py-8"
    >
      <HeroRibbonRow durationS={PRODUCT_MARQUEE_DURATION_S}>
        {MARQUEE_LOOP.map((id, index) => (
          <ProductMarqueeItem key={`${id}-${index}`} label={t(id)} isAccent={index % 2 === 1} />
        ))}
      </HeroRibbonRow>
    </section>
  );
}
