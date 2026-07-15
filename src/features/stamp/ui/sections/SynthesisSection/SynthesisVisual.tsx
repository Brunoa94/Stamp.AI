import { Sparkles } from "lucide-react";
import { Span } from "@/features/ui/span";
import { STAMP_EDIT_SUGGESTIONS } from "../../../lib/constants/stampProducts";
import { SuggestionCard } from "./SuggestionCard";
import { NoFilterCard, NO_FILTER_ID } from "./NoFilterCard";

/**
 * SynthesisVisual
 *
 * Left panel — a Gemini-style grid of suggested edits. Each tile is a
 * representative thumbnail image with the label overlaid on a gradient
 * scrim; selecting a tile updates the selected suggestion via `onSelectSuggestion`.
 */

interface PropsI {
  selectedId: string | null;
  onSelectSuggestion?: (id: string) => void;
}

export function SynthesisVisual({ selectedId, onSelectSuggestion }: PropsI) {
  const isNoFilterSelected =
    selectedId === null || selectedId === NO_FILTER_ID;

  return (
    <div className="p-12 lg:p-24 bg-white flex flex-col justify-center border-r border-(--color-stamp-divider)">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-4 h-4 text-(--color-stamp-gold)" />
        <Span
          variant="micro"
          className="text-[10px] tracking-widest text-(--color-stamp-taupe)"
        >
          Suggested Edits
        </Span>
      </div>
      <Span variant="sm" className="text-(--color-stamp-taupe)/70 mb-8 max-w-xs">
        Tap a suggestion to seed your prompt, then refine it on the right.
      </Span>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {STAMP_EDIT_SUGGESTIONS.map(({ id, label, hint, image }) => {
          const isSelected = selectedId === id;
          return (
            <SuggestionCard
              key={id}
              id={id}
              label={label}
              hint={hint}
              image={image}
              isSelected={isSelected}
              onSelect={onSelectSuggestion}
            />
          );
        })}
        <NoFilterCard
          isSelected={isNoFilterSelected}
          onSelect={onSelectSuggestion}
        />
      </div>
    </div>
  );
}
