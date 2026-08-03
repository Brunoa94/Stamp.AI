"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { useStampCartActions } from "../../../lib/hooks/useStampCartActions";
import {
  useStampFinalization,
  useStampProductSelection,
  useStampCustomization,
} from "../../../lib/hooks/useStampSelectors";
import { MockupCarousel } from "./MockupCarousel";
import { ReviewDetails } from "./ReviewDetails";

/**
 * FinalReviewSection
 *
 * Step 8: Final product review and acquisition
 * Protocol 08 / Acquisition
 */

function FinalReviewSectionComponent() {
  const t = useTranslations("stamp.finalReview");
  const { handleBagIt, handleBuyNow, isAddingToCart } = useStampCartActions();
  const { mockupImageUrl, mockupImages } = useStampFinalization();
  const { selectedProductTitle } = useStampProductSelection();
  const { selectedColor, selectedSize, selectedPriceCents } =
    useStampCustomization();

  const fallbackUrl =
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop";

  const productName = selectedProductTitle || t("defaultProductName");

  // Format price from cents to dollars
  const formattedPrice = selectedPriceCents
    ? `$${(selectedPriceCents / 100).toFixed(2)}`
    : "$0.00";

  return (
    <section
      id="step-8"
      className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <MockupCarousel
        mockupImages={mockupImages}
        fallbackUrl={mockupImageUrl || fallbackUrl}
      />
      <ReviewDetails
        productName={productName}
        color={selectedColor}
        size={selectedSize}
        price={formattedPrice}
        isAddingToCart={isAddingToCart}
        onBagIt={handleBagIt}
        onBuyNow={handleBuyNow}
      />
    </section>
  );
}

export const FinalReviewSection = memo(FinalReviewSectionComponent);
