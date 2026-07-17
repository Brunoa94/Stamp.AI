import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import type { SizeType } from "../../../lib/types/stampTypes";

/**
 * SizeSelector
 *
 * Size selection component with tile buttons
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
      <Label className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-6">
        {t("sizeSelectorLabel")}
      </Label>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={t("sizeSelectionAria")}
      >
        {sizes.map((size) => {
          const isActive = selectedSize === size;
          return (
            <Button
              key={size}
              variant="ghost"
              onClick={() => onSelectSize(size)}
              className={`rounded-none px-6 py-3 h-auto border transition-all duration-300 ${
                isActive
                  ? "bg-(--color-stamp-chocolate) text-white border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate)"
                  : "bg-transparent text-(--color-stamp-chocolate) border-(--color-stamp-divider) hover:border-(--color-stamp-chocolate) hover:bg-transparent"
              }`}
              aria-pressed={isActive}
              aria-label={t("sizeAria", { size })}
            >
              <Span variant="micro">{size}</Span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
