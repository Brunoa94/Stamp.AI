import { DiagonalBackdrop } from "@/shared/ui/DiagonalBackdrop";
import { HeroStampWall } from "./HeroStampWall";

/**
 * HeroBackdrop
 *
 * Decorative background of the hero's first screen: the shared diagonal
 * backdrop with its default cut (58% → 38%), filled with the drifting wall of
 * product stamps instead of a photo, leaving the flow demo on the off-white
 * side on xl+; below xl it fills the screen under a darker scrim.
 */
export function HeroBackdrop() {
  return (
    <DiagonalBackdrop>
      <HeroStampWall />
    </DiagonalBackdrop>
  );
}
