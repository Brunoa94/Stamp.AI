interface PromptSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const QUICK_SUGGESTIONS = ["90s Retro", "Cyberpunk", "Minimalist Line Art"];

export function PromptSuggestions({
  onSuggestionClick,
}: PromptSuggestionsProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-accent text-slate-400 uppercase tracking-wider font-bold">
        Quick Suggestions:
      </p>
      <div className="flex flex-wrap gap-2">
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-[#F3ECFF] hover:text-[#7C3AED] text-slate-500 rounded-sm transition-soft"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
