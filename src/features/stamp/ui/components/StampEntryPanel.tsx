import { cn } from "@/lib/utils";
import { StampScan } from "./StampScan/StampScan";

interface PropsI {
  /** On the entry step (00); off it, the panel has swept into the backdrop */
  isActive: boolean;
}

/**
 * StampEntryPanel
 *
 * From lg, the entry step's left half: the animated product scan, fixed over
 * the sliding canvas (it only covers HeroSection's empty left column there)
 * and under the steps sidebar. Leaving the entry step, its scene fades and the
 * chocolate panel wipes right across the incoming step on a slant, into the
 * exact shape of the canvas backdrop, then fades to reveal step 01's photo
 * beneath; going back reverses the sweep. Below lg the scan sits in
 * HeroSection as a strip (`.stamp-entry-panel*` in globals.css).
 */
export function StampEntryPanel({ isActive }: PropsI) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "stamp-entry-panel pointer-events-none absolute inset-x-0 top-24 bottom-0 hidden bg-(--color-stamp-chocolate) lg:block",
        isActive && "stamp-entry-panel--active",
      )}
    >
      <div className="stamp-entry-panel__scene absolute inset-y-0 left-0">
        <StampScan />
      </div>
    </div>
  );
}
