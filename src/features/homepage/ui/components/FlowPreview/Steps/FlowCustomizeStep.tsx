"use client";

import { ChevronDown, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { getColorHex } from "@/features/homepage/lib/constants/colorSwatches";
import {
  FLOW_ROTATIONS_DEG,
  FLOW_SWATCHES,
} from "@/features/homepage/lib/constants/flowPreview";
import type { FlowPrintSizeType } from "@/features/homepage/lib/types/flowPreview";
import { FlowStepTitle } from "../Mock/FlowStepTitle";
import { FlowLabel } from "../Mock/FlowLabel";
import { FlowMockButton } from "../Mock/FlowMockButton";
import { FlowSliderTrack } from "../Mock/FlowSliderTrack";
import { FlowArtImage } from "../Mock/FlowArtImage";

interface PropsI {
  printSize: FlowPrintSizeType;
  rotationIndex: number;
}

const boxClassName = "border border-(--color-stamp-chocolate)/10";
const selectedBoxClassName = "border-2 border-(--color-stamp-gold)";

/**
 * FlowCustomizeStep
 *
 * Step 06: print placement on the tee; the print grows, shrinks back and
 * rotates while color and size stay on White / M.
 */
export function FlowCustomizeStep({ printSize, rotationIndex }: PropsI) {
  const t = useTranslations("home.flowPreview.customize");
  const printTransform = `scale(${printSize.pct / 100}) rotate(${FLOW_ROTATIONS_DEG[rotationIndex]}deg)`;

  return (
    <div className="animate-flow-fade flex h-full flex-col-reverse justify-end gap-4 px-5 py-6 sm:flex-row sm:justify-start sm:gap-6 sm:px-7">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <FlowLabel size="sm" className="hidden sm:block">{t("printPositions")}</FlowLabel>
        <div className="hidden gap-1.5 sm:flex">
          <Span unstyled className={cn("flex flex-1 flex-col px-2 py-1.5 text-2xs uppercase", selectedBoxClassName)}>
            {t("front")}
            <Span unstyled className="text-4xs text-(--color-stamp-chocolate)/60">{t("included")}</Span>
          </Span>
          <Span unstyled className={cn("flex flex-1 flex-col px-2 py-1.5 text-2xs uppercase", boxClassName)}>
            {t("back")}
            <Span unstyled className="text-4xs text-(--color-stamp-chocolate)/60">{t("included")}</Span>
          </Span>
        </div>

        <div className="relative h-36 w-38 self-center sm:h-49.5 sm:w-52.5">
          <FlowArtImage art="teePrintArea" className="size-full" />
          <div
            className="absolute left-1/2 top-[26%] w-3/10 -translate-x-1/2 transition-transform duration-500"
            style={{ transform: printTransform }}
          >
            <FlowArtImage art="pup" className="w-full" />
          </div>
        </div>

        <FlowLabel size="sm" className="hidden sm:block">{t("size")}</FlowLabel>
        <div className="hidden items-center gap-2 text-2xs text-(--color-stamp-chocolate)/80 sm:flex">
          <Span unstyled className={cn("flex size-4.5 items-center justify-center", boxClassName)}>
            <Minus className="size-2.5" />
          </Span>
          <FlowSliderTrack knobPct={printSize.knobPct} />
          <Span unstyled className={cn("flex size-4.5 items-center justify-center", boxClassName)}>
            <Plus className="size-2.5" />
          </Span>
          {t("sizePct", { value: printSize.pct })}
        </div>

        <FlowLabel size="sm" className="hidden sm:block">{t("rotation")}</FlowLabel>
        <div className="hidden gap-1.5 sm:flex">
          {FLOW_ROTATIONS_DEG.map((deg, index) => (
            <Span
              key={deg}
              unstyled
              className={cn("px-2 py-1 text-2xs", index === rotationIndex ? selectedBoxClassName : boxClassName)}
            >
              {t("rotationValue", { value: deg })}
            </Span>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3.5">
        <FlowStepTitle messageKey="customize.title" className="text-3xl sm:text-4xl" />
        <FlowLabel size="sm">{t("colors")}</FlowLabel>
        <div className="flex gap-2.5">
          {FLOW_SWATCHES.map((color, index) => (
            <Span unstyled
              key={color}
              className={cn(
                "size-6 rounded-full",
                index === 0 ? "border-2 border-(--color-stamp-gold)" : "border border-(--color-stamp-chocolate)/10",
              )}
              style={{ backgroundColor: getColorHex(color) }}
            />
          ))}
        </div>
        <FlowLabel size="sm">{t("sizeSelector")}</FlowLabel>
        <div className={cn("flex items-center justify-between bg-(--color-stamp-white) px-2.5 py-2 text-xs", boxClassName)}>
          {t("sizeValue")}
          <ChevronDown className="size-3 text-(--color-stamp-chocolate)/80" />
        </div>
        <FlowMockButton tone="dark">{t("create")}</FlowMockButton>
      </div>
    </div>
  );
}
