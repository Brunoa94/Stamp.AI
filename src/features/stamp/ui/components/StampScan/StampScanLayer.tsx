import { cn } from "@/lib/utils";
import { STAMP_SCAN_COLUMNS } from "../../../lib/constants/stampScan";
import type { StampScanSlideT } from "../../../lib/types/stampScan";
import { StampScanColumn } from "./StampScanColumn";

interface PropsI {
  /** Which shot every tile of this layer shows */
  srcKey: keyof Pick<StampScanSlideT, "blankSrc" | "printedSrc">;
  className?: string;
}

/**
 * StampScanLayer
 *
 * One full set of the scan's drifting columns, showing every product blank or
 * printed. The scene stacks a blank and a printed layer with identical
 * columns and timing, so their tiles line up exactly.
 */
export function StampScanLayer({ srcKey, className }: PropsI) {
  return (
    <div className={cn("stamp-scan__layer absolute inset-0 flex", className)}>
      {STAMP_SCAN_COLUMNS.map((column) => (
        <StampScanColumn key={column.id} column={column} srcKey={srcKey} />
      ))}
    </div>
  );
}
