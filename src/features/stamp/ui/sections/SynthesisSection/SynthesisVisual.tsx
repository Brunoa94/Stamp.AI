import { Sparkles } from "lucide-react";
import { Span } from "@/features/ui/span";
import { STAMP_EDIT_SUGGESTIONS } from "../../../lib/constants/stampProducts";

/**
 * SynthesisVisual
 *
 * Left panel — a Gemini-style grid of suggested edits. Each tile is a
 * representative thumbnail image with the label overlaid on a gradient
 * scrim; selecting a tile seeds the synthesis prompt via `onSelectSuggestion`.
 */

interface PropsI {
  onSelectSuggestion?: (prompt: string) => void;
}

export function SynthesisVisual({ onSelectSuggestion }: PropsI) {
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
      <p className="text-sm text-(--color-stamp-taupe)/70 mb-8 max-w-xs">
        Tap a suggestion to seed your prompt, then refine it on the right.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {STAMP_EDIT_SUGGESTIONS.map(({ id, label, hint, prompt, image }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectSuggestion?.(prompt)}
            aria-label={`Apply suggestion: ${label} — ${hint}`}
            title={hint}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-black/5 hover:ring-2 hover:ring-(--color-stamp-gold) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) transition-all duration-300"
          >
            {/* Thumbnail */}
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
              style={{ backgroundImage: `url(${image})` }}
            />
            {/* Subtle bottom gradient for label legibility */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"
            />
            {/* Single short label, bottom-left */}
            <span className="absolute bottom-2 left-2.5 right-2 text-left text-[13px] font-medium text-white drop-shadow-sm">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
