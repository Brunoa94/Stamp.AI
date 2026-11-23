import { memo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { stampSelectableCardVariants } from "../../../lib/variants/stampStudioVariants";

/**
 * SuggestionCard
 *
 * Selectable filter tile: a rounded photo card with the filter name on a
 * chocolate scrim. Selected shows the amber border; unselected lifts on hover.
 */

interface PropsI {
  id: string;
  label: string;
  hint: string;
  image: string;
  isSelected: boolean;
  onSelect?: (id: string) => void;
}

function SuggestionCardComponent({
  id,
  label,
  hint,
  image,
  isSelected,
  onSelect,
}: PropsI) {
  const t = useTranslations("stamp.synthesis");
  return (
    <Button
      variant="unstyled"
      onClick={() => onSelect?.(id)}
      aria-label={t("applySuggestion", { label, hint })}
      aria-pressed={isSelected}
      title={hint}
      className={cn(
        stampSelectableCardVariants({ selected: isSelected }),
        "group relative aspect-2/3 w-full min-h-48 overflow-hidden p-0",
      )}
    >
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-(--color-stamp-chocolate)/80 to-transparent"
      />
      <Span
        variant="sm"
        className="absolute bottom-2 left-2.5 right-2 text-left font-medium text-(--color-stamp-off-white) max-xl:text-xs"
      >
        {label}
      </Span>
    </Button>
  );
}

export const SuggestionCard = memo(SuggestionCardComponent);
