import { memo } from "react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
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
 * On tablet and desktop (md+): all 16 filters in a 4 x 4 grid that fills the
 *                  panel below the back button at any screen size, with a
 *                  "Select your filter" line under it
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
  const isNoFilterSelected = selectedId === null || selectedId === NO_FILTER_ID;

  // Tablet and desktop (md+): a 4 x 4 grid filling the panel
  if (isMdUp) {
    return (
      <div className="flex flex-col border-r border-(--color-stamp-divider) bg-(--color-stamp-white) px-10 pt-24 pb-10">
        {/* The top padding clears the fixed back button; the grid takes the
            rest of the panel, whatever the screen size, and each card
            stretches to its cell (16 filters, 4 x 4) */}
        <div className="grid min-h-0 w-full flex-1 grid-cols-4 grid-rows-4 gap-3 xl:gap-4">
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
        <Span as="p" variant="script" className="pt-4 text-center text-2xl text-(--color-stamp-taupe)">
          {t("selectFilter")}
        </Span>
      </div>
    );
  }

  // Mobile (<md): use ExpandablePicker component
  return (
    <div className="p-6 pt-20 bg-(--color-stamp-white) flex flex-col border-r border-(--color-stamp-divider)">
      <div className="my-auto w-full">
        <ExpandablePicker
          initialCount={MOBILE_INITIAL_COUNT}
          showMoreLabel={t("showMore", { count: "{count}" })}
          showLessLabel={t("showLess")}
          columns={2}
          gap={3}
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
