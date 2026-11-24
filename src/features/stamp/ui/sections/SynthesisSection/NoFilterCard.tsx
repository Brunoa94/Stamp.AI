import { memo } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { stampSelectableCardVariants } from "../../../lib/variants/stampStudioVariants";

/**
 * NoFilterCard
 *
 * Card for selecting no filter/style — uses original image as-is.
 */

const NO_FILTER_ID = "no-filter";

interface PropsI {
  isSelected: boolean;
  onSelect?: (id: string) => void;
}

function NoFilterCardComponent({ isSelected, onSelect }: PropsI) {
  const t = useTranslations("stamp.synthesis.noFilter");
  return (
    <Button
      variant="unstyled"
      onClick={() => onSelect?.(NO_FILTER_ID)}
      aria-label={t("aria")}
      aria-pressed={isSelected}
      title={t("hint")}
      className={cn(
        stampSelectableCardVariants({ selected: isSelected }),
        "group relative flex aspect-4/5 w-full md:aspect-auto md:h-full items-center justify-center overflow-hidden bg-(--color-stamp-cream) p-0",
      )}
    >
      <Span
        variant="sm"
        className="absolute bottom-2 left-2.5 right-2 text-left font-medium text-(--color-stamp-chocolate) max-xl:text-xs"
      >
        {t("label")}
      </Span>
    </Button>
  );
}

export const NoFilterCard = memo(NoFilterCardComponent);
export { NO_FILTER_ID };
