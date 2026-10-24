"use client";

import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { FLOW_PRODUCTS } from "@/features/homepage/lib/constants/flowPreview";
import { FlowStepTitle } from "../Mock/FlowStepTitle";
import { FlowMockButton } from "../Mock/FlowMockButton";
import { FlowProductCard } from "./FlowProductCard";

interface PropsI {
  isTeeSelected: boolean;
}

/**
 * FlowProductStep
 *
 * Step 05: the product grid; the kids tee gets picked and "Continue" unlocks.
 */
export function FlowProductStep({ isTeeSelected }: PropsI) {
  const t = useTranslations("home.flowPreview.product");

  return (
    <div className="animate-flow-fade flex h-full flex-col gap-4 px-5 py-6 sm:flex-row sm:gap-5.5 sm:px-7.5">
      <div className="flex flex-col gap-3 sm:w-50 sm:shrink-0">
        <FlowStepTitle messageKey="product.title" className="sm:text-4xl" />
        <Paragraph variant="caption" className="hidden leading-relaxed text-(--color-stamp-chocolate)/80 sm:block">
          {t("description")}
        </Paragraph>
        <div className="hidden flex-1 sm:block" />
        <FlowMockButton
          tone={isTeeSelected ? "dark" : "muted"}
          className="hidden text-3xs tracking-widest sm:flex"
        >
          {t("continue")}
        </FlowMockButton>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Span variant="pill" className="font-semibold tracking-widest text-(--color-stamp-taupe)">
          {t("category")}
        </Span>
        <div className="grid grid-cols-2 gap-2">
          {FLOW_PRODUCTS.map((product) => (
            <FlowProductCard
              key={product.id}
              product={product}
              isSelected={isTeeSelected && product.id === "kidsTee"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
