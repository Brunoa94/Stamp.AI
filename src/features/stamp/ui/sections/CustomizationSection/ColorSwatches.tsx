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
import { cn } from "@/lib/utils";
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
      <Label variant="section" className="mb-4">
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
          className="flex flex-wrap gap-3 p-1"
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
                variant="unstyled"
                onClick={() => onSelectColor(colorName)}
                className={cn(
                  "h-10 w-10 rounded-full border-2 p-0 transition-all duration-200 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-stamp-chocolate)",
                  isActive
                    ? "ring-2 ring-(--color-stamp-chocolate) ring-offset-2 ring-offset-(--color-stamp-off-white)"
                    : "hover:ring-2 hover:ring-(--color-stamp-chocolate)/30 hover:ring-offset-2 hover:ring-offset-(--color-stamp-off-white)",
                  isFallbackHex && colorClass ? colorClass : "",
                )}
                style={{
                  ...(isFallbackHex && colorClass
                    ? {}
                    : { backgroundColor: colorHex }),
                  borderColor,
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
