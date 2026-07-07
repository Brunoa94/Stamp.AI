import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";

/**
 * PreservationSlider
 *
 * Slider control for adjusting preservation level
 */

interface PropsI {
  value: number;
  onChange: (value: number) => void;
}

export function PreservationSlider({ value, onChange }: PropsI) {
  return (
    <div>
      <Label
        htmlFor="preservation"
        className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-4"
      >
        Preservation
      </Label>
      <div className="flex items-center gap-4">
        <Span
          variant="micro"
          className="text-(--color-stamp-taupe)/40"
        >
          LOW
        </Span>
        <input
          id="preservation"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-px bg-(--color-stamp-divider) appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-(--color-stamp-gold) [&::-webkit-slider-thumb]:rounded-full"
          aria-label="Preservation level slider"
        />
        <Span
          variant="micro"
          className="text-(--color-stamp-taupe)/40"
        >
          HIGH
        </Span>
      </div>
    </div>
  );
}
