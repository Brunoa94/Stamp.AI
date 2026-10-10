import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";

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

  return (
    <div
      className="flex flex-wrap gap-3"
      role="radiogroup"
      aria-label={t("paperTypeSelectionAria")}
    >
      {paperTypes.map((paperType) => (
        <Button
          key={paperType}
          variant="ghost"
          onClick={() => onSelectPaperType(paperType)}
          className={`px-4 py-2 h-auto rounded-none border text-xs font-medium uppercase tracking-widest transition-colors duration-300 hover:bg-transparent ${
            selectedPaperType === paperType
              ? "border-(--color-stamp-gold) text-(--color-stamp-chocolate)"
              : "border-(--color-stamp-divider) text-(--color-stamp-taupe)"
          }`}
          aria-pressed={selectedPaperType === paperType}
          aria-label={t("paperTypeAria", { type: paperType })}
        >
          {paperType}
        </Button>
      ))}
    </div>
  );
}
