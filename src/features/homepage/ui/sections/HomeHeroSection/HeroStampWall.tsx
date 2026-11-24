import { HERO_STAMP_WALL_COLUMNS } from "@/features/homepage/lib/constants/stampWall";
import { HeroStampWallColumn } from "./HeroStampWallColumn";

/**
 * HeroStampWall
 *
 * The hero's backdrop: every product we print, as perforated postage stamps on
 * a tilted wall whose columns drift in opposite directions at their own pace.
 * A few stamps turn over from the customer's photo to the printed product and
 * get a gold postmark. Fills the hero's left block inside HeroBackdrop, which
 * adds the scrim behind the start card; decorative only. Motion
 * stops under prefers-reduced-motion (globals.css, `.stamp-wall`).
 */
export function HeroStampWall() {
  return (
    <div className="stamp-wall absolute inset-0 overflow-hidden">
      <div className="stamp-wall__plane flex gap-6">
        {HERO_STAMP_WALL_COLUMNS.map((column) => (
          <HeroStampWallColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
