import Image from "next/image";
import type { StampScanColumnT, StampScanSlideT } from "../../../lib/types/stampScan";

/** The track holds two copies of the products so the loop has no seam */
const LOOP_COPIES = ["first", "second"] as const;

interface PropsI {
  column: StampScanColumnT;
  srcKey: keyof Pick<StampScanSlideT, "blankSrc" | "printedSrc">;
}

/**
 * StampScanColumn
 *
 * One endless column of the scan, drifting down: renders its products twice
 * and slides the track by half its height, so the second copy takes over
 * seamlessly. Pace comes from the column.
 */
export function StampScanColumn({ column, srcKey }: PropsI) {
  return (
    <div className="stamp-scan__column-track flex-1">
      <div
        className="stamp-scan__column flex flex-col"
        style={{ animationDuration: `${column.durationS}s` }}
      >
        {LOOP_COPIES.map((copy) => (
          <div key={copy} className="stamp-scan__copy flex flex-col">
            {column.tiles.map((tile) => (
              <div key={tile.id} className="relative aspect-square w-full overflow-hidden rounded-md">
                <Image src={tile[srcKey]} alt="" fill sizes="(min-width: 1024px) 14vw, 33vw" className="object-cover" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
