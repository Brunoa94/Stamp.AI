// TODO: Restore when stamp-wall images are uploaded to R2
// import { HERO_STAMP_WALL_COLUMNS } from "@/features/homepage/lib/constants/stampWall";
// import { HeroStampWallColumn } from "./HeroStampWallColumn";

/**
 * HeroStampWall
 *
 * The hero's backdrop: every product we print, as perforated postage stamps on
 * a tilted wall whose columns drift in opposite directions at their own pace.
 * A few stamps turn over from the customer's photo to the printed product and
 * get a gold postmark. Fills the hero's left block inside HeroBackdrop, which
 * adds the scrim behind the start card; decorative only. Motion
 * stops under prefers-reduced-motion (globals.css, `.stamp-wall`).
 *
 * TEMPORARILY DISABLED: stamp-wall images not yet uploaded to R2.
 */
export function HeroStampWall() {
  // Temporarily return empty div until stamp-wall images are in R2
  return <div className="stamp-wall absolute inset-0" />;
}
