"use client";

import { useStampCartActions } from "../../../lib/hooks/useStampCartActions";
import {
  useStampFinalization,
  useStampSelectedImage,
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
  const { enhancedPrompt } = useStampSelectedImage();

  const mockupUrl =
    mockupImageUrl ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop";

  const productName = enhancedPrompt || "Premium T-Shirt";

  return (
    <section
      id="step-8"
      className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <MockupPreview mockupUrl={mockupUrl} />
      <ReviewDetails
        productName={productName}
        isAddingToCart={isAddingToCart}
        onBagIt={handleBagIt}
        onBuyNow={handleBuyNow}
      />
    </section>
  );
}
