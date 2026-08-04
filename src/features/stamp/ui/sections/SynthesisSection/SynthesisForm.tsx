import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Button } from "@/features/ui/button";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { InfoTooltip } from "@/features/ui/info-tooltip";
import { PromptInput } from "./PromptInput";
import { PreservationSlider } from "./PreservationSlider";

/**
 * SynthesisForm
 *
 * Right panel form with all synthesis controls
 */

interface PropsI {
  prompt: string;
  preservation: number;
  removeBackground: boolean;
  maxPromptLength: number;
  isGenerating: boolean;
  onPromptChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onPreservationChange: (value: number) => void;
  onRemoveBackgroundChange: (value: boolean) => void;
  onGenerate: () => void;
}

export function SynthesisForm({
  prompt,
  preservation,
  removeBackground,
  maxPromptLength,
  isGenerating,
  onPromptChange,
  onPreservationChange,
  onRemoveBackgroundChange,
  onGenerate,
}: PropsI) {
  const t = useTranslations("stamp.synthesis");

  return (
    <div className="p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>

      {/* Form Fields */}
      <div className="space-y-8 mb-12">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          maxLength={maxPromptLength}
        />
        <PreservationSlider
          value={preservation}
          onChange={onPreservationChange}
        />
        <div className="flex items-center gap-3">
          <Checkbox
            id="removeBackground"
            checked={removeBackground}
            onCheckedChange={(checked) =>
              onRemoveBackgroundChange(checked === true)
            }
            aria-label={t("removeBackgroundAria")}
            className="data-[state=checked]:bg-(--color-stamp-gold) data-[state=checked]:border-(--color-stamp-gold)"
          />
          <Label
            htmlFor="removeBackground"
            className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) cursor-pointer"
          >
            {t("removeBackgroundLabel")}
          </Label>
          <InfoTooltip content={t("removeBackgroundTooltip")} />
        </div>
      </div>

      {/* Generate Button */}
      <div>
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? t("generating") : t("generate")}
        </Button>
      </div>
    </div>
  );
}
