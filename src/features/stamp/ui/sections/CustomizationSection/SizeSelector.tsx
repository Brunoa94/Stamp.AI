import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import type { SizeType } from "../../../lib/types/stampTypes";
import { formatSizeForDisplay } from "../../../lib/helpers/sizeDisplayMapper";

/**
 * SizeSelector
 *
 * Size selection component with dropdown select
 */

interface PropsI {
  sizes: SizeType[];
  selectedSize: SizeType;
  onSelectSize: (size: SizeType) => void;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}: PropsI) {
  const t = useTranslations("stamp.customization");

  return (
    <div>
      <Label
        htmlFor="size-select"
        className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-3"
      >
        {t("sizeSelectorLabel")}
      </Label>
      <Select
        value={selectedSize}
        onValueChange={(value) => onSelectSize(value as SizeType)}
      >
        <SelectTrigger
          id="size-select"
          aria-label={t("sizeSelectionAria")}
          className="w-full px-4 py-3 border border-(--color-stamp-divider) bg-white text-(--color-stamp-chocolate) text-sm font-medium focus:border-(--color-stamp-chocolate) focus:ring-0"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sizes.map((size) => (
            <SelectItem key={size} value={size}>
              {formatSizeForDisplay(size)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
