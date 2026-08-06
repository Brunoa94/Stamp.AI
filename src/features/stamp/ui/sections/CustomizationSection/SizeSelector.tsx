import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import type { SizeType } from "../../../lib/types/stampTypes";

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
      <select
        id="size-select"
        value={selectedSize}
        onChange={(e) => onSelectSize(e.target.value as SizeType)}
        className="w-full px-4 py-3 border border-(--color-stamp-divider) bg-white text-(--color-stamp-chocolate) text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-(--color-stamp-chocolate) transition-colors duration-200"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A3728'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "16px",
        }}
        aria-label={t("sizeSelectionAria")}
      >
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
