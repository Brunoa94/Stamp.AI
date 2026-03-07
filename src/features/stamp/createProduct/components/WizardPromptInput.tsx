import { Wand2 } from "lucide-react";
import { Label } from "@/features/ui/label";
import { Textarea } from "@/features/ui/textarea";
import { PromptSuggestions } from "./PromptSuggestions";

interface WizardPromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function WizardPromptInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Describe your design idea...",
}: WizardPromptInputProps) {
  const handleSuggestionClick = (suggestion: string) => {
    const syntheticEvent = {
      target: { value: suggestion },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-xl relative overflow-hidden group">
      {/* Decorative purple blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7C3AED]/5 rounded-full blur-3xl group-hover:bg-[#7C3AED]/10 transition-soft"></div>

      {/* Label */}
      <Label
        htmlFor="ai-prompt"
        className="text-xs font-bold font-accent text-slate-500 uppercase tracking-[0.25em] mb-4"
      >
        <Wand2 className="text-[#7C3AED] w-4 h-4" />
        Design Concept Creator
      </Label>

      {/* Textarea Container */}
      <div className="relative">
        <Textarea
          id="ai-prompt"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-white/30 border-2 border-slate-200/60 rounded-sm p-6 text-xl font-accent text-slate-900 italic focus:outline-none focus:border-[#7C3AED] focus:bg-white/50 transition-soft resize-none placeholder-slate-400 shadow-inner"
        />
        <div className="absolute bottom-4 right-4 text-[10px] font-accent text-slate-400 uppercase tracking-widest font-bold">
          AI Engine v4.2
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-6">
        <PromptSuggestions onSuggestionClick={handleSuggestionClick} />
      </div>
    </div>
  );
}
