"use client";

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
 * Sizes are fetched dynamically from the variants API.
 * Products like tote bags and mugs have different sizes than apparel.
 */

export function CustomizationSection() {
  const {
    blueprintId,
    printProviderId,
    availableColors,
    selectedColor,
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
    selectedColor,
    effectiveSelectedSize,
    createProduct,
  });

  return (
    <section
      id="step-6"
      className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
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
