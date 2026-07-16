import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("stamp.synthesis");

  return (
    <div>
      <Label
        htmlFor="prompt-input"
        className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-4"
      >
        {t("promptLabel")}
      </Label>
      <Textarea
        id="prompt-input"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full h-24 resize-none bg-transparent border-b border-(--color-stamp-divider) focus:border-(--color-stamp-gold) focus:bg-(--color-stamp-gold)/5 transition-all px-2 py-3 text-sm"
        placeholder={t("promptPlaceholder")}
        aria-label={t("promptAria")}
      />
      <div className="flex justify-end mt-2">
        <Span
          variant="micro"
          className="text-(--color-stamp-taupe)/40"
        >
          {t("counter", { count: value.length, max: maxLength })}
        </Span>
      </div>
    </div>
  );
}
