import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PropsI {
  /** Knob position along the track (0–100) */
  knobPct: number;
  className?: string;
}

/**
 * FlowSliderTrack
 *
 * Hairline slider with a gold knob, drawn (not interactive) for the demo.
 */
export function FlowSliderTrack({ knobPct, className }: PropsI) {
  return (
    <div className={cn("relative h-px flex-1 bg-(--color-stamp-chocolate)/15", className)}>
      <Span unstyled
        className="absolute -top-1.5 size-3 -translate-x-1/2 rounded-full bg-(--color-stamp-gold) transition-[left] duration-500"
        style={{ left: `${knobPct}%` }}
      />
    </div>
  );
}
