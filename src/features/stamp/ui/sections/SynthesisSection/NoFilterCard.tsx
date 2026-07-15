import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

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

export function NoFilterCard({ isSelected, onSelect }: PropsI) {
  return (
    <Button
      variant="ghost"
      onClick={() => onSelect?.(NO_FILTER_ID)}
      aria-label="No filter — Use original image without style changes"
      aria-pressed={isSelected}
      title="Use original image without style changes"
      className={`group relative aspect-4/5 overflow-hidden rounded-2xl p-0 ring-1 focus:outline-none transition-all duration-300 bg-linear-to-br from-stone-100 to-stone-200 flex items-center justify-center ${
        isSelected
          ? "ring-2 ring-(--color-stamp-gold)"
          : "ring-black/5 hover:ring-2 hover:ring-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)"
      }`}
    >
      <Span
        variant="sm"
        className="absolute bottom-2 left-2.5 right-2 text-left font-medium text-(--color-stamp-taupe) drop-shadow-sm"
      >
        No filter
      </Span>
    </Button>
  );
}

export { NO_FILTER_ID };
