import { Label } from "@/features/ui/label";
import { STAMP_ART_STYLES } from "../../../lib/constants/stampProducts";

/**
 * ArtStyleSelect
 *
 * Dropdown for selecting art style
 */

interface PropsI {
  value: string;
  onChange: (value: string) => void;
}

export function ArtStyleSelect({ value, onChange }: PropsI) {
  return (
    <div>
      <Label
        htmlFor="art-style"
        className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-4"
      >
        Art Style
      </Label>
      <select
        id="art-style"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-(--color-stamp-divider) focus:border-(--color-stamp-gold) focus:bg-(--color-stamp-gold)/5 transition-all px-0 py-3 text-sm cursor-pointer"
        aria-label="Select art style"
      >
        {STAMP_ART_STYLES.map((style) => (
          <option key={style.id} value={style.id}>
            {style.label}
          </option>
        ))}
      </select>
    </div>
  );
}
