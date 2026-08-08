import { memo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { STAMP_EDIT_SUGGESTIONS } from "../../../lib/constants/stampProducts";
import { ExpandablePicker } from "../../components/ExpandablePicker/ExpandablePicker";
import { SuggestionCard } from "./SuggestionCard";
import { NoFilterCard, NO_FILTER_ID } from "./NoFilterCard";

/**
 * SynthesisVisual
 *
 * Left panel — filter picker for suggested edits.
 *
 * On mobile (<md): shows first 4 filters with "Show more" button that expands
 *                  as an overlay. Auto-collapses when scrolled past 40% threshold.
 * On tablet (md to lg): shows 3-column grid with header
 * On desktop (lg+): shows original 4-column grid
 */

// Number of filters to show initially on mobile before expanding
const MOBILE_INITIAL_COUNT = 4;

interface PropsI {
  selectedId: string | null;
  onSelectSuggestion?: (id: string) => void;
}

function SynthesisVisualComponent({ selectedId, onSelectSuggestion }: PropsI) {
  const t = useTranslations("stamp.synthesis");
  const ts = useTranslations("stamp.suggestions");
  const isMdUp = useMediaQuery("(min-width: 768px)", true);
  const isLgUp = useMediaQuery("(min-width: 1024px)", true);
  const isNoFilterSelected = selectedId === null || selectedId === NO_FILTER_ID;

  // Header with sparkles icon
  const header = (
    <div className="flex items-center gap-3 mb-6">
      <Sparkles className="w-4 h-4 text-(--color-stamp-gold)" />
      <Span
        variant="micro"
        className="text-[10px] tracking-widest text-(--color-stamp-taupe)"
      >
        {t("eyebrow")}
      </Span>
    </div>
  );

  // Desktop (lg+): 4-column grid
  if (isLgUp) {
    return (
      <div className="p-12 lg:p-24 lg:pt-8 overflow-hidden lg:px-10 bg-white flex flex-col justify-center border-r border-(--color-stamp-divider)">
        {header}
        <div className="grid grid-cols-4 gap-4 w-full">
          {STAMP_EDIT_SUGGESTIONS.map(({ id, image }) => (
            <SuggestionCard
              key={id}
              id={id}
              label={ts(`${id}.label`)}
              hint={ts(`${id}.hint`)}
              image={image}
              isSelected={selectedId === id}
              onSelect={onSelectSuggestion}
            />
          ))}
          <NoFilterCard
            isSelected={isNoFilterSelected}
            onSelect={onSelectSuggestion}
          />
        </div>
      </div>
    );
  }

  // Tablet (md to lg): 3-column grid
  if (isMdUp) {
    return (
      <div className="p-10 pt-8 overflow-hidden bg-white flex flex-col justify-center border-r border-(--color-stamp-divider)">
        {header}
        <div className="grid grid-cols-3 gap-4 w-full">
          {STAMP_EDIT_SUGGESTIONS.map(({ id, image }) => (
            <SuggestionCard
              key={id}
              id={id}
              label={ts(`${id}.label`)}
              hint={ts(`${id}.hint`)}
              image={image}
              isSelected={selectedId === id}
              onSelect={onSelectSuggestion}
            />
          ))}
          <NoFilterCard
            isSelected={isNoFilterSelected}
            onSelect={onSelectSuggestion}
          />
        </div>
      </div>
    );
  }

  // Mobile (<md): use ExpandablePicker component
  return (
    <div className="p-6 pt-20 bg-white flex flex-col border-r border-(--color-stamp-divider)">
      <div className="my-auto w-full">
        <ExpandablePicker
          initialCount={MOBILE_INITIAL_COUNT}
          showMoreLabel={t("showMore", { count: "{count}" })}
          showLessLabel={t("showLess")}
          columns={2}
          gap={3}
          header={header}
        >
          {STAMP_EDIT_SUGGESTIONS.map(({ id, image }) => (
            <SuggestionCard
              key={id}
              id={id}
              label={ts(`${id}.label`)}
              hint={ts(`${id}.hint`)}
              image={image}
              isSelected={selectedId === id}
              onSelect={onSelectSuggestion}
            />
          ))}
          <NoFilterCard
            isSelected={isNoFilterSelected}
            onSelect={onSelectSuggestion}
          />
        </ExpandablePicker>
      </div>
    </div>
  );
}

export const SynthesisVisual = memo(SynthesisVisualComponent);
