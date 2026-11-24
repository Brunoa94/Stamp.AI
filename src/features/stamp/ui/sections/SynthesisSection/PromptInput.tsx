import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/features/ui/label";
import { Textarea } from "@/features/ui/textarea";
import { Span } from "@/features/ui/span";
import { SplitToneText } from "../../components/SplitToneText";

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
      <Label htmlFor="prompt-input" variant="section" className="mb-3">
        <SplitToneText tone="muted">{t("promptLabel")}</SplitToneText>
      </Label>
      <Textarea
        id="prompt-input"
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="h-24 w-full resize-none rounded-lg border-(--color-stamp-divider) bg-(--color-stamp-white) px-3 py-3 text-sm text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe) focus-visible:border-(--color-stamp-chocolate) focus-visible:ring-(--color-stamp-chocolate)/15 md:text-sm"
        placeholder={t("promptPlaceholder")}
        aria-label={t("promptAria")}
      />
      <div className="flex justify-end mt-2">
        <Span variant="micro">
          <SplitToneText tone="muted">
            {t("counter", { count: value.length, max: maxLength })}
          </SplitToneText>
        </Span>
      </div>
    </div>
  );
}
