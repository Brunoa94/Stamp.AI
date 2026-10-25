import {
  HERO_RIBBON_LIFESTYLE_LOOP,
  HERO_RIBBON_PRODUCTS_LOOP,
} from "@/features/homepage/lib/constants/heroShowcase";
import { HeroRibbonRow } from "../../components/HeroRibbonRow";
import { HeroRibbonTile } from "./HeroRibbonTile";

/**
 * HeroPhotoRibbon
 *
 * Two rows of product photos drifting in opposite directions under the hero:
 * products out in the world, then finished product shots.
 * Decorative, so hidden from assistive tech.
 */
export function HeroPhotoRibbon() {
  return (
    <div
      aria-hidden="true"
      className="hero-showcase flex flex-col gap-3 overflow-hidden mask-x-from-90% mask-x-to-100%"
    >
      <HeroRibbonRow durationS={90}>
        {HERO_RIBBON_LIFESTYLE_LOOP.map((src, index) => (
          <HeroRibbonTile key={`${src}-${index}`} src={src} />
        ))}
      </HeroRibbonRow>
      <HeroRibbonRow durationS={75} isReversed>
        {HERO_RIBBON_PRODUCTS_LOOP.map((src, index) => (
          <HeroRibbonTile key={`${src}-${index}`} src={src} />
        ))}
      </HeroRibbonRow>
    </div>
  );
}
