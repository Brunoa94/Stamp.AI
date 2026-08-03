import { memo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

/**
 * SuggestionCard
 *
 * Individual suggestion tile with thumbnail image and label overlay.
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
      variant="ghost"
      onClick={() => onSelect?.(id)}
      aria-label={t("applySuggestion", { label, hint })}
      aria-pressed={isSelected}
      title={hint}
      className={`group relative aspect-2/3 w-full min-h-48 overflow-hidden rounded-xl p-0 ring-1 focus:outline-none transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-(--color-stamp-gold)"
          : "ring-black/5 hover:ring-2 hover:ring-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)"
      }`}
    >
      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110">
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/70 to-transparent"
      />
      <Span
        variant="sm"
        className="absolute bottom-2 left-2.5 right-2 text-left font-medium text-white drop-shadow-sm"
      >
        {label}
      </Span>
    </Button>
  );
}

export const SuggestionCard = memo(SuggestionCardComponent);
