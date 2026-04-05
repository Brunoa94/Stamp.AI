import { Textarea } from "@/features/ui/textarea";
import { CreateProductSelectors } from "../../../context/selectors";
import { WizardPromptCustomization } from "./WizardPromptCustomization";

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
  placeholder = "e.g. A minimalist geometric tiger in a cyberpunk aesthetic with neon accents...",
}: WizardPromptInputProps) {
  const showPromptCustomization =
    CreateProductSelectors.showPromptCustomization();

  return (
    <div className="relative h-full overflow-hidden rounded-2xl p-4 transition-all duration-300">
      {!showPromptCustomization && (
        <div className="relative z-10 flex h-full flex-col animate-[slideIn_0.35s_ease-out]">
          <Textarea
            id="ai-prompt"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={6}
            className="min-h-32 w-full flex-1 resize-none rounded-xl border border-white/40 bg-white/70 px-4 py-4 text-[14px] text-[#1A2340] placeholder:text-[#B8B7CC] placeholder:italic focus:border-[#7B5CF5] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow:
                "inset 0 2px 8px rgba(26, 35, 64, 0.05), inset 0 -1px 0 rgba(255,255,255,0.3)",
            }}
          />
        </div>
      )}

      {showPromptCustomization && (
        <WizardPromptCustomization disabled={disabled} />
      )}
    </div>
  );
}
