import { memo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
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

function SynthesisVisualComponent({ selectedId, onSelectSuggestion }: PropsI) {
  const t = useTranslations("stamp.synthesis");
  const ts = useTranslations("stamp.suggestions");
  const isNoFilterSelected = selectedId === null || selectedId === NO_FILTER_ID;

  return (
    <div className="p-12 lg:p-24 lg:pt-8 overflow-hidden lg:px-10 bg-white flex flex-col justify-center border-r border-(--color-stamp-divider)">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-4 h-4 text-(--color-stamp-gold)" />
        <Span
          variant="micro"
          className="text-[10px] tracking-widest text-(--color-stamp-taupe)"
        >
          {t("eyebrow")}
        </Span>
      </div>

      <div className="grid grid-cols-4 gap-4 w-full">
        {STAMP_EDIT_SUGGESTIONS.map(({ id, image }) => {
          const isSelected = selectedId === id;
          return (
            <SuggestionCard
              key={id}
              id={id}
              label={ts(`${id}.label`)}
              hint={ts(`${id}.hint`)}
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

export const SynthesisVisual = memo(SynthesisVisualComponent);
