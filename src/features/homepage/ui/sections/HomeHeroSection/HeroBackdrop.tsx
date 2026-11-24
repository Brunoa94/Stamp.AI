import { HeroStampWall } from "./HeroStampWall";

/**
 * HeroBackdrop
 *
 * Decorative background of the hero's left block: the drifting wall of
 * product stamps filling the block, under a chocolate scrim that is darkest
 * at the top left, behind the start card, and lets the stamps show through
 * towards the bottom right.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-(--color-stamp-chocolate)">
      <HeroStampWall />
      <div className="absolute inset-0 bg-linear-120 from-(--color-stamp-chocolate)/75 via-(--color-stamp-chocolate)/45 to-(--color-stamp-chocolate)/15" />
    </div>
  );
}
