"use client";

import { memo, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CustomizationPreview } from "./CustomizationPreview";
import { CustomizationControls } from "./CustomizationControls";
import { useCustomizationData } from "../../../lib/hooks/useCustomizationData";
import { useCustomizationEffects } from "../../../lib/hooks/useCustomizationEffects";
import { useCustomizationHandlers } from "../../../lib/hooks/useCustomizationHandlers";

/**
 * CustomizationSection
 *
 * Step 6: Customize product color and size
 * Protocol 06 / Refinement
 *
 * On desktop (md+): Shows both panels side by side
 * On mobile (<md): Two-step flow:
 *   - Step 6a: "Customize Your Product" (color/size selection)
 *   - Step 6b: "Preview & Placement" (design adjustment)
 *
 * Sizes are fetched dynamically from the variants API.
 * Products like tote bags and mugs have different sizes than apparel.
 */

type MobileSubStep = "customize" | "preview";

function CustomizationSectionComponent() {
  const isMdUp = useMediaQuery("(min-width: 768px)", true);
  const [mobileSubStep, setMobileSubStep] = useState<MobileSubStep>("customize");

  const {
    blueprintId,
    printProviderId,
    availableColors,
    selectedColor,
    effectiveSelectedColor,
    setSelectedColor,
    isLoadingVariants,
    availableSizes,
    selectedSize,
    setSelectedSize,
    effectiveSelectedSize,
    createProduct,
    isFinalizing,
    canCreateProduct,
  } = useCustomizationData();

  useCustomizationEffects({
    availableColors,
    selectedColor,
    setSelectedColor,
    availableSizes,
    selectedSize,
    setSelectedSize,
  });

  const { handleCreateProduct } = useCustomizationHandlers({
    blueprintId,
    printProviderId,
    selectedColor: effectiveSelectedColor,
    effectiveSelectedSize,
    createProduct,
  });

  // Mobile: navigate to preview sub-step
  const handleContinueToPreview = () => {
    setMobileSubStep("preview");
  };

  // Desktop: show both panels side by side
  if (isMdUp) {
    return (
      <section
        id="step-6"
        className="h-full overflow-y-auto grid grid-cols-1 md:grid-cols-2 border-b border-(--color-stamp-divider)"
      >
        <CustomizationPreview />
        <CustomizationControls
          colors={availableColors}
          selectedColor={selectedColor}
          sizes={availableSizes}
          selectedSize={effectiveSelectedSize}
          isLoadingColors={isLoadingVariants}
          hasProduct={Boolean(blueprintId)}
          canCreate={canCreateProduct}
          isFinalizing={isFinalizing}
          onSelectColor={setSelectedColor}
          onSelectSize={(size) => setSelectedSize(size)}
          onCreateProduct={handleCreateProduct}
        />
      </section>
    );
  }

  // Mobile: two-step flow
  return (
    <section
      id="step-6"
      className="h-full overflow-y-auto border-b border-(--color-stamp-divider)"
    >
      {mobileSubStep === "customize" ? (
        <CustomizationControls
          colors={availableColors}
          selectedColor={selectedColor}
          sizes={availableSizes}
          selectedSize={effectiveSelectedSize}
          isLoadingColors={isLoadingVariants}
          hasProduct={Boolean(blueprintId)}
          canCreate={canCreateProduct}
          isFinalizing={isFinalizing}
          onSelectColor={setSelectedColor}
          onSelectSize={(size) => setSelectedSize(size)}
          onCreateProduct={handleCreateProduct}
          // Mobile-specific props
          isMobileFlow
          onContinueToPreview={handleContinueToPreview}
        />
      ) : (
        <CustomizationPreview
          // Mobile-specific props
          isMobileFlow
          canCreate={canCreateProduct}
          isFinalizing={isFinalizing}
          onCreateProduct={handleCreateProduct}
        />
      )}
    </section>
  );
}

export const CustomizationSection = memo(CustomizationSectionComponent);
