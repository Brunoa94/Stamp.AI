"use client";

import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Separator } from "@/features/ui/separator";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { FLOW_MOCKUP_DOTS } from "@/features/homepage/lib/constants/flowPreview";
import { FlowStepTitle } from "../Mock/FlowStepTitle";
import { FlowMockButton } from "../Mock/FlowMockButton";
import { FlowArtImage } from "../Mock/FlowArtImage";

interface PropsI {
  /** The scripted user has pressed "Bag it" */
  isBagged: boolean;
}

/**
 * FlowFinalStep
 *
 * Step 08: the printed tee mockup next to the order summary and bag actions.
 */
export function FlowFinalStep({ isBagged }: PropsI) {
  const t = useTranslations("home.flowPreview.final");

  return (
    <div className="animate-flow-fade flex h-full flex-col items-center gap-4 px-5 py-5 sm:flex-row sm:gap-6 sm:px-7.5 sm:py-7">
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
        <div className="animate-flow-pop relative w-44 -rotate-2 bg-(--color-stamp-white) p-2.5 shadow-xl shadow-(--color-stamp-chocolate)/15 sm:w-62.5 sm:p-3">
          <Span
            variant="pill"
            className="absolute left-5 top-5 z-10 border border-(--color-stamp-chocolate)/10 bg-(--color-stamp-white) px-1.5 py-0.5 text-4xs tracking-widest text-(--color-stamp-chocolate)"
          >
            {t("badge")}
          </Span>
          <div className="relative flex h-28 items-center justify-center bg-(--color-flow-art-mockup-backdrop) sm:h-57.5">
            <div className="relative w-5/6">
              <FlowArtImage art="tee" className="w-full" />
              <FlowArtImage art="pup" className="absolute left-1/2 top-[26%] w-1/4 -translate-x-1/2" />
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-(--color-stamp-chocolate)/80 sm:flex">
          <ChevronLeft className="size-3" />
          <Span unstyled className="flex gap-1">
            {FLOW_MOCKUP_DOTS.map((dot) => (
              <Span unstyled
                key={dot}
                className={cn(
                  "size-1.25 rounded-full",
                  dot === 0 ? "bg-(--color-stamp-chocolate)" : "bg-(--color-stamp-chocolate)/20",
                )}
              />
            ))}
          </Span>
          <ChevronRight className="size-3" />
        </div>
        <Span unstyled className="hidden text-2xs text-(--color-stamp-chocolate)/80 sm:block">
          {t("counter")}
        </Span>
      </div>

      <div className="flex w-full min-w-0 flex-1 flex-col gap-3">
        <FlowStepTitle messageKey="final.title" className="text-3xl sm:text-4xl" />
        <div className="flex flex-col gap-1.5 border border-(--color-stamp-chocolate)/10 bg-(--color-stamp-white) p-3">
          <Span unstyled className="text-xs text-(--color-stamp-chocolate)">
            {t("productName")}
          </Span>
          <Span unstyled className="text-4xs uppercase tracking-wider text-(--color-stamp-chocolate)/80">
            {t("variant")}
          </Span>
          <Separator className="my-1 bg-(--color-stamp-chocolate)/10" />
          <div className="flex items-baseline justify-between">
            <Span unstyled className="text-2xs uppercase text-(--color-stamp-chocolate)">
              {t("total")}
            </Span>
            <Span variant="strong" className="text-3xl text-(--color-stamp-chocolate)">
              {t("price")}
            </Span>
          </div>
        </div>
        <FlowMockButton tone={isBagged ? "pressed" : "dark"}>
          <ShoppingBag className="size-3" />
          {t("bag")}
        </FlowMockButton>
        <FlowMockButton tone="gold" className="h-10 text-3xs">
          {t("bagAnother")}
        </FlowMockButton>
      </div>
    </div>
  );
}
