import { ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
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
  maxPromptLength: number;
  isGenerating: boolean;
  onPromptChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onPreservationChange: (value: number) => void;
  onGenerate: () => void;
}

export function SynthesisForm({
  prompt,
  preservation,
  maxPromptLength,
  isGenerating,
  onPromptChange,
  onPreservationChange,
  onGenerate,
}: PropsI) {
  const t = useTranslations("stamp.synthesis");

  return (
    <div className="p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Span variant="sm" className="text-(--color-stamp-taupe) mb-6">
        {t("protocol")}
      </Span>

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
