import { ChangeEvent } from "react";
import { Label } from "@/features/ui/label";
import { Textarea } from "@/features/ui/textarea";
import { Span } from "@/features/ui/span";

/**
 * PromptInput
 *
 * Textarea for entering synthesis prompt with character counter
 */

interface PropsI {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
}

export function PromptInput({ value, onChange, maxLength }: PropsI) {
  return (
    <div>
      <Label
        htmlFor="prompt-input"
        className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-4"
      >
        Prompt Synthesis
      </Label>
      <Textarea
        id="prompt-input"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full h-24 resize-none bg-transparent border-b border-(--color-stamp-divider) focus:border-(--color-stamp-gold) focus:bg-(--color-stamp-gold)/5 transition-all px-2 py-3 text-sm"
        placeholder="Describe silhouette, texture, and atmospheric intent..."
        aria-label="Prompt synthesis input"
      />
      <div className="flex justify-end mt-2">
        <Span
          variant="micro"
          className="text-(--color-stamp-taupe)/40"
        >
          {value.length} / {maxLength}
        </Span>
      </div>
    </div>
  );
}
