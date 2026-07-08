import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
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
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="art-style" aria-label="Select art style" className="w-full">
          <SelectValue placeholder="Select art style" />
        </SelectTrigger>
        <SelectContent>
          {STAMP_ART_STYLES.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              {style.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
