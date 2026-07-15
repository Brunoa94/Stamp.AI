"use client";

import { getCuratedBlueprintById } from "@/lib/printify/curatedBlueprints";
import { useStampCartActions } from "../../../lib/hooks/useStampCartActions";
import {
  useStampFinalization,
  useStampProductSelection,
  useStampSelectedImage,
  useStampCustomization,
} from "../../../lib/hooks/useStampSelectors";
import { MockupPreview } from "./MockupPreview";
import { ReviewDetails } from "./ReviewDetails";

/**
 * FinalReviewSection
 *
 * Step 8: Final product review and acquisition
 * Protocol 08 / Acquisition
 */

export function FinalReviewSection() {
  const { handleBagIt, handleBuyNow, isAddingToCart } = useStampCartActions();
  const { mockupImageUrl } = useStampFinalization();
  const { blueprintId } = useStampProductSelection();
  const { enhancedPrompt } = useStampSelectedImage();
  const { selectedColor, selectedSize, selectedPriceCents } = useStampCustomization();

  const mockupUrl =
    mockupImageUrl ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop";

  const blueprint = blueprintId ? getCuratedBlueprintById(blueprintId) : null;
  const productName = blueprint?.title || "Custom Product";

  // Format price from cents to dollars
  const formattedPrice = selectedPriceCents
    ? `$${(selectedPriceCents / 100).toFixed(2)}`
    : "$0.00";

  return (
    <section
      id="step-8"
      className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <MockupPreview mockupUrl={mockupUrl} />
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
