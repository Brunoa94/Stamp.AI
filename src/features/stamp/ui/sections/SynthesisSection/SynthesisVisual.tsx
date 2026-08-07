import { memo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { STAMP_EDIT_SUGGESTIONS } from "../../../lib/constants/stampProducts";
import { Disclosure } from "../../components/Disclosure/Disclosure";
import { SuggestionCard } from "./SuggestionCard";
import { NoFilterCard, NO_FILTER_ID } from "./NoFilterCard";

/**
 * SynthesisVisual
 *
 * Left panel — a collapsible filter picker. The trigger shows the currently
 * selected filter; expanding it reveals the tile grid of suggested edits.
 * Keeping the grid folded lets the whole step fit the viewport without
 * scrolling. On large screens a preview of the selected filter fills the
 * panel below the picker.
 */

interface PropsI {
  selectedId: string | null;
  onSelectSuggestion?: (id: string) => void;
}

function SynthesisVisualComponent({ selectedId, onSelectSuggestion }: PropsI) {
  const t = useTranslations("stamp.synthesis");
  const ts = useTranslations("stamp.suggestions");
  const [pickerOpen, setPickerOpen] = useState(false);
  const isNoFilterSelected = selectedId === null || selectedId === NO_FILTER_ID;

  const selectedSuggestion = isNoFilterSelected
    ? undefined
    : STAMP_EDIT_SUGGESTIONS.find(({ id }) => id === selectedId);
  const selectedLabel = selectedSuggestion
    ? ts(`${selectedSuggestion.id}.label`)
    : t("noFilter.label");

  const handleSelect = (id: string) => {
    onSelectSuggestion?.(id);
    setPickerOpen(false);
  };

  return (
    <div className="p-6 pt-16 md:p-10 md:pt-16 lg:p-16 lg:pt-16 xl:p-24 xl:pt-24 bg-white flex flex-col border-r border-(--color-stamp-divider)">
      <div className="my-auto w-full space-y-4">
        <Disclosure
          label={t("eyebrow")}
          value={selectedLabel}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
        >
          <div className="grid max-h-[45vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {STAMP_EDIT_SUGGESTIONS.map(({ id, image }) => (
              <SuggestionCard
                key={id}
                id={id}
                label={ts(`${id}.label`)}
                hint={ts(`${id}.hint`)}
                image={image}
                isSelected={selectedId === id}
                onSelect={handleSelect}
              />
            ))}
            <NoFilterCard
              isSelected={isNoFilterSelected}
              onSelect={handleSelect}
            />
          </div>
        </Disclosure>

        {/* Selected filter preview — desktop only, keeps the panel visual */}
        <div className="relative mx-auto hidden w-full max-w-60 overflow-hidden rounded-xl ring-1 ring-black/5 lg:block aspect-2/3">
          {selectedSuggestion ? (
            <Image
              src={selectedSuggestion.image}
              alt={selectedLabel}
              fill
              className="object-cover"
              sizes="240px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-stone-100 to-stone-200" />
          )}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/60 to-transparent"
          />
          <Span
            variant="sm"
            className={`absolute bottom-2 left-2.5 right-2 text-left font-medium drop-shadow-sm ${
              selectedSuggestion ? "text-white" : "text-(--color-stamp-taupe)"
            }`}
          >
            {selectedLabel}
          </Span>
        </div>
      </div>
    </div>
  );
}

export const SynthesisVisual = memo(SynthesisVisualComponent);
