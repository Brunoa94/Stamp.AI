
"use client";

import { memo, useCallback, useMemo } from "react";
import { Heading } from "@/features/ui/heading";
import { useFormContext } from "react-hook-form";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { useStampFlowStore } from "../../lib/context/StampFormContext";
import { FinalReviewCard } from "../components/FinalReviewCard";
import { useStampCartActions } from "../../lib/hooks/useStampCartActions";
import { PRODUCT_TYPE_MAP } from "../../lib/constants/stampSteps";

export const FinalReviewSection = memo(function FinalReviewSection() {
  const { watch } = useFormContext<StampFormData>();
  const productType = watch("productType");
  const selectedColor = watch("selectedColor");
  const selectedSize = watch("selectedSize");

  // Use Zustand for enhanced prompt
  const enhancedPrompt = useStampFlowStore((s) => s.enhancedPrompt);
  const prompt = watch("prompt");

  const { handleAddToCart } = useStampCartActions();

  // Memoize computed values
  const productConfig = useMemo(
    () => (productType ? PRODUCT_TYPE_MAP[productType] : null),
    [productType],
  );

  const productTitle = useMemo(
    () => enhancedPrompt || prompt || "Custom Design",
    [enhancedPrompt, prompt],
  );

  const variantInfo = useMemo(
    () =>
      selectedColor && selectedSize
        ? `${selectedColor} / ${selectedSize}`
        : undefined,
    [selectedColor, selectedSize],
  );

  const displayTitle = useMemo(
    () =>
      productConfig ? `${productConfig.name} - ${productTitle}` : productTitle,
    [productConfig, productTitle],
  );

  // Stable callbacks
  const handleBagIt = useCallback(() => {
    handleAddToCart(false);
  }, [handleAddToCart]);

  const handleBuyNow = useCallback(() => {
    handleAddToCart(true);
  }, [handleAddToCart]);

  return (
    <section id="step-8" className="stamp-section p-12 lg:p-24">
      {/* Background decorations */}
      <div className="section-bg-overlay">
        <div className="gradient-layer"></div>
      </div>

      <div className="max-w-6xl border-l-4 border-brandOrange/30 pl-8 md:pl-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-12 gap-4">
          <div className="h-1.5 w-20 bg-linear-to-r from-brandOrange to-transparent mb-6 md:mb-0" />

          <Heading
            variant="section"
            className="flex-1 text-center md:text-left"
          >
            08 / Final <span className="text-brandOrange">Review</span>
          </Heading>
        </div>

        <FinalReviewCard
          productTitle={displayTitle}
          productPrice={55.0} // Base price, would come from API in production
          variantInfo={variantInfo}
          onBagIt={handleBagIt}
          onBuyNow={handleBuyNow}
        />
      </div>
    </section>
  );
});
