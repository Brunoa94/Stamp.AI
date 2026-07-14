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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STAMP_EDIT_SUGGESTIONS.map(({ id, label, hint, prompt, image }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectSuggestion?.(prompt)}
            aria-label={`Apply suggestion: ${label}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-(--color-stamp-divider) hover:border-(--color-stamp-gold) focus:outline-none focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/40 transition-all duration-300"
          >
            {/* Thumbnail */}
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${image})` }}
            />
            {/* Legibility scrim */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
            />
            {/* Label */}
            <div className="absolute inset-x-0 bottom-0 p-3 text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-white">
                {label}
              </span>
              <span className="block text-[10px] text-white/70 mt-0.5">
                {hint}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
