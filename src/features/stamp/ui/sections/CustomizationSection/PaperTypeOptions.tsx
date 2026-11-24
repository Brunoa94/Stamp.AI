import { useTranslations } from "next-intl";
import { useProductLabel } from "@/shared/hooks/useProductLabel";
import { Button } from "@/features/ui/button";
import { stampChipVariants } from "../../../lib/variants/stampStudioVariants";

/**
 * PaperTypeOptions
 *
 * Labelled paper type choices (Blank, Lined, ...) for notebooks, which carry
 * their paper type in the variant's color option.
 */

interface PropsI {
  paperTypes: string[];
  selectedPaperType?: string;
  onSelectPaperType: (paperType: string) => void;
}

export function PaperTypeOptions({
  paperTypes,
  selectedPaperType,
  onSelectPaperType,
}: PropsI) {
  const t = useTranslations("stamp.customization");
  const label = useProductLabel();

  return (
    <div
      className="flex flex-wrap gap-3"
      role="radiogroup"
      aria-label={t("paperTypeSelectionAria")}
    >
      {paperTypes.map((paperType) => (
        <Button
          key={paperType}
          variant="unstyled"
          onClick={() => onSelectPaperType(paperType)}
          className={stampChipVariants({ selected: selectedPaperType === paperType })}
          aria-pressed={selectedPaperType === paperType}
          aria-label={t("paperTypeAria", { type: label("paperType", paperType) })}
        >
          {label("paperType", paperType)}
        </Button>
      ))}
    </div>
  );
}
