"use client";

import { Check, Coins, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { FLOW_PROMPT_MAX_CHARS } from "@/features/homepage/lib/constants/flowPreview";
import { FlowStepTitle } from "../Mock/FlowStepTitle";
import { FlowLabel } from "../Mock/FlowLabel";
import { FlowMockButton } from "../Mock/FlowMockButton";
import { FlowSliderTrack } from "../Mock/FlowSliderTrack";

interface PropsI {
  prompt: string;
  typedCount: number;
  isPromptComplete: boolean;
}

/**
 * FlowDescribeStep
 *
 * Step 02: the prompt types itself out, then "Stamp it!" lights up.
 */
export function FlowDescribeStep({ prompt, typedCount, isPromptComplete }: PropsI) {
  const t = useTranslations("home.flowPreview.describe");

  return (
    <div className="animate-flow-fade flex flex-col gap-3 px-6 py-7 sm:px-10">
      <FlowStepTitle messageKey="describe.title" />

      <FlowLabel>{t("promptLabel")}</FlowLabel>
      <div className="h-20 rounded-sm border-2 border-(--color-stamp-chocolate)/20 bg-(--color-stamp-cream) px-3 py-2.5 text-sm leading-normal text-(--color-stamp-chocolate)">
        {prompt.slice(0, typedCount)}
        <Span unstyled className="animate-flow-blink ml-px inline-block h-4 w-0.5 -mb-0.5 bg-(--color-stamp-chocolate)" />
      </div>
      <Span unstyled className="self-end text-2xs text-(--color-stamp-chocolate)/60">
        {t("charCount", { count: typedCount, max: FLOW_PROMPT_MAX_CHARS })}
      </Span>

      <FlowLabel className="flex items-center gap-2">
        {t("preservation")}
        <Info className="size-3.5 text-(--color-stamp-taupe)" />
      </FlowLabel>
      <div className="flex items-center gap-3 text-2xs uppercase text-(--color-stamp-chocolate)/60">
        {t("low")}
        <FlowSliderTrack knobPct={50} />
        {t("high")}
      </div>

      <FlowLabel className="flex items-center gap-2.5">
        <Span unstyled className="flex size-4 items-center justify-center rounded-xs bg-(--color-stamp-gold)">
          <Check className="size-2.5 text-(--color-stamp-white)" strokeWidth={3.5} />
        </Span>
        {t("removeBackground")}
      </FlowLabel>
      <Span unstyled className="flex items-center gap-1.5 self-end text-2xs uppercase text-(--color-stamp-chocolate)/80">
        <Coins className="size-3.5 text-(--color-stamp-gold)" />
        {t("coins")}
      </Span>

      <FlowMockButton tone={isPromptComplete ? "dark" : "muted"}>{t("submit")}</FlowMockButton>
    </div>
  );
}
