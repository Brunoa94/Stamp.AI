"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { FlowStepTitle } from "../Mock/FlowStepTitle";
import { FlowMockButton } from "../Mock/FlowMockButton";
import { FlowArtImage } from "../Mock/FlowArtImage";

interface PropsI {
  /** The scripted user hovers "Use this image" near the end of the step */
  isUseHighlighted: boolean;
}

/**
 * FlowResultsStep
 *
 * Step 04: the generated design pops in, with previous creations and the
 * "Use this image" / "Repeat" actions.
 */
export function FlowResultsStep({ isUseHighlighted }: PropsI) {
  const t = useTranslations("home.flowPreview.results");

  return (
    <div className="animate-flow-fade flex flex-col gap-3 px-6 py-6 sm:px-10">
      <FlowStepTitle messageKey="results.title" />

      <div className="animate-flow-pop flex size-56 items-center justify-center self-center bg-(--color-stamp-white) shadow-xl shadow-(--color-stamp-chocolate)/15 sm:size-70">
        <FlowArtImage art="pup" className="w-4/5" />
      </div>

      <Span variant="pill" className="font-semibold tracking-widest text-(--color-stamp-taupe)">
        {t("previous")}
      </Span>
      <div className="flex gap-2">
        <div className="flex size-11 items-center justify-center border-2 border-(--color-stamp-gold) bg-(--color-stamp-white)">
          <FlowArtImage art="pup" className="w-9" />
        </div>
        <div className="flex size-11 items-center justify-center border border-(--color-stamp-chocolate)/10 bg-(--color-stamp-white)">
          <FlowArtImage art="pupPhoto" className="w-9" />
        </div>
      </div>

      <div className="flex gap-3">
        <FlowMockButton tone={isUseHighlighted ? "gold" : "dark"} className="flex-1">
          {t("use")}
        </FlowMockButton>
        <FlowMockButton tone="outline" className="flex-1">
          {t("repeat")}
        </FlowMockButton>
      </div>
    </div>
  );
}
