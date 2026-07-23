import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import {
  getBorderColor,
  getColorHex,
} from "@/features/homepage/lib/constants/colorSwatches";
import { getColorClass } from "@/helpers/colors/colorMapping";

/**
 * ColorSwatches
 *
 * Color selection component with swatches
 */

interface PropsI {
  colors: string[];
  selectedColor?: string;
  isLoading: boolean;
  hasProduct: boolean;
  onSelectColor: (color: string) => void;
}

export function ColorSwatches({
  colors,
  selectedColor,
  isLoading,
  hasProduct,
  onSelectColor,
}: PropsI) {
  const t = useTranslations("stamp.customization");

  return (
    <div>
      <Label className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-6">
        {t("colorLabel")}
      </Label>
      {isLoading ? (
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("colorLoading")}
        </Span>
      ) : !hasProduct ? (
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("colorSelectFirst")}
        </Span>
      ) : colors.length === 0 ? (
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("colorNone")}
        </Span>
      ) : (
        <div
          className="flex gap-4"
          role="radiogroup"
          aria-label={t("colorSelectionAria")}
        >
          {colors.map((colorName) => {
            const isActive = selectedColor === colorName;
            const colorHex = getColorHex(colorName);
            const borderColor = getBorderColor(colorHex);
            const colorClass = getColorClass(colorName);
            const isFallbackHex = colorHex.toLowerCase() === "#cccccc";
            return (
              <Button
                key={colorName}
                variant="ghost"
                onClick={() => onSelectColor(colorName)}
                className={`w-10 h-10 rounded-full p-0 transition-all duration-300 ${
                  isActive
                    ? "border-2 border-(--color-stamp-gold) scale-110 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-transparent"
                    : "border-2 border-transparent hover:bg-transparent"
                } ${isFallbackHex && colorClass ? colorClass : ""}`}
                style={{
                  ...(isFallbackHex && colorClass
                    ? {}
                    : { backgroundColor: colorHex }),
                  borderColor: isActive
                    ? "var(--color-stamp-gold)"
                    : borderColor,
                }}
                aria-pressed={isActive}
                aria-label={t("colorSwatchAria", { color: colorName })}
                title={colorName}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
