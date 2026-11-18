import type { StampWallTileT } from "@/features/homepage/lib/types/stampWall";
import { HeroStampFace } from "./HeroStampFace";

interface PropsI {
  tile: StampWallTileT;
  /** Position in its column, to stagger the flips so they never turn together */
  index: number;
}

/**
 * HeroStampWallTile
 *
 * One stamp on the wall. A plain tile is a single stamp; a tile with a
 * `flipSrc` is two stamps back to back that turn over from the customer's
 * photo to the printed product, which carries the gold postmark.
 */
export function HeroStampWallTile({ tile, index }: PropsI) {
  if (!tile.flipSrc) return <HeroStampFace src={tile.src} />;

  return (
    <div
      className="stamp-wall__flip relative"
      style={{ animationDelay: `${index * 1.6}s` }}
    >
      <HeroStampFace src={tile.src} />
      <HeroStampFace src={tile.flipSrc} isBack hasPostmark />
    </div>
  );
}
