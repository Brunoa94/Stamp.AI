import type { StampWallColumnT } from "@/features/homepage/lib/types/stampWall";
import { HeroStampWallTile } from "./HeroStampWallTile";

/** The track holds two copies of the stamps so the loop has no seam */
const LOOP_COPIES = ["first", "second"] as const;

interface PropsI {
  column: StampWallColumnT;
}

/**
 * HeroStampWallColumn
 *
 * One endless vertical column of the stamp wall: renders its stamps twice and
 * slides the track by half its height, so the second copy takes over
 * seamlessly. Pace and direction come from the column.
 */
export function HeroStampWallColumn({ column }: PropsI) {
  return (
    <div
      className="stamp-wall__column flex shrink-0 flex-col"
      style={{
        animationDuration: `${column.durationS}s`,
        animationDirection: column.isReversed ? "reverse" : "normal",
      }}
    >
      {LOOP_COPIES.map((copy) => (
        <div key={copy} className="flex flex-col gap-6 pb-6">
          {column.tiles.map((tile, index) => (
            <HeroStampWallTile key={tile.id} tile={tile} index={index} />
          ))}
        </div>
      ))}
    </div>
  );
}
