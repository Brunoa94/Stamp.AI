import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import {
  DEFAULT_COLOR,
  getBorderColor,
  getColorHex,
} from "@/features/homepage/lib/constants/colorSwatches";
import { getColorClass } from "@/helpers/colors/colorMapping";
import { useProductLabel } from "@/shared/hooks/useProductLabel";
import type { VariantOptionKindType } from "../../../lib/helpers/productCategoryDetector";
import { PaperTypeOptions } from "./PaperTypeOptions";
import { SplitToneText } from "../../components/SplitToneText";

/**
 * ColorSwatches
 *
 * Color selection component with swatches. Notebooks reuse it for their
 * paper type (Blank, Lined, ...), shown as labelled options instead of swatches.
 */

interface PropsI {
  colors: string[];
  optionKind?: VariantOptionKindType;
  selectedColor?: string;
  isLoading: boolean;
  hasProduct: boolean;
  onSelectColor: (color: string) => void;
}

export function ColorSwatches({
  colors,
  optionKind = "color",
  selectedColor,
  isLoading,
  hasProduct,
  onSelectColor,
}: PropsI) {
  const t = useTranslations("stamp.customization");
  const label = useProductLabel();
  const isPaperType = optionKind === "paperType";

  return (
    <div>
      <Label className="text-[10px] font-bold uppercase tracking-widest block mb-6">
        <SplitToneText tone="muted">
          {isPaperType ? t("paperTypeLabel") : t("colorLabel")}
        </SplitToneText>
      </Label>
      {isLoading ? (
        <Span variant="micro">
          <SplitToneText tone="muted">{t("colorLoading")}</SplitToneText>
        </Span>
      ) : !hasProduct ? (
        <Span variant="micro">
          <SplitToneText tone="muted">{t("colorSelectFirst")}</SplitToneText>
        </Span>
      ) : colors.length === 0 ? (
        <Span variant="micro">
          <SplitToneText tone="muted">{t("colorNone")}</SplitToneText>
        </Span>
      ) : isPaperType ? (
        <PaperTypeOptions
          paperTypes={colors}
          selectedPaperType={selectedColor}
          onSelectPaperType={onSelectColor}
        />
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
            const isFallbackHex = colorHex.toLowerCase() === DEFAULT_COLOR.toLowerCase();
            return (
              <Button
                key={colorName}
                variant="ghost"
                onClick={() => onSelectColor(colorName)}
                className={`w-10 h-10 rounded-full p-0 ring-2 ring-white transition-all duration-300 ${
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
                aria-label={t("colorSwatchAria", { color: label("color", colorName) })}
                title={label("color", colorName)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
