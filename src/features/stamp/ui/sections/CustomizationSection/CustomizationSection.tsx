"use client";

import { useEffect, useMemo } from "react";
import { useBlueprintVariants } from "@/queries/productQueries";
import { useStampProductCreation } from "../../../lib/hooks/useStampProductCreation";
import {
  useStampProductSelection,
  useStampSelectedImage,
  useStampCustomization,
} from "../../../lib/hooks/useStampSelectors";
import {
  STAMP_SIZES,
  DEFAULT_SIZE,
} from "../../../lib/constants/stampColors";
import type { SizeType } from "../../../lib/types/stampTypes";
import { CustomizationPreview } from "./CustomizationPreview";
import { CustomizationControls } from "./CustomizationControls";

/**
 * CustomizationSection
 *
 * Step 6: Customize product color and size
 * Protocol 06 / Refinement
 */

export function CustomizationSection() {
  const { handleCreateProduct: createProduct, isFinalizing } =
    useStampProductCreation();
  const { blueprintId, printProviderId } = useStampProductSelection();
  const { selectedImageUrl } = useStampSelectedImage();
  const { selectedColor, setSelectedColor, selectedSize, setSelectedSize } =
    useStampCustomization();
  const { data: variants, isLoading: isLoadingVariants } = useBlueprintVariants(
    blueprintId,
    printProviderId,
  );

  const availableColors = useMemo(
    () => (variants?.colors || []).filter(Boolean),
    [variants?.colors],
  );

  // Initialize selectedSize with default if not set
  useEffect(() => {
    if (!selectedSize) {
      setSelectedSize(DEFAULT_SIZE);
    }
  }, [selectedSize, setSelectedSize]);

  // Auto-select first available color when colors load
  useEffect(() => {
    if (availableColors.length === 0) {
      setSelectedColor(undefined);
      return;
    }

    // If current selection is valid, keep it; otherwise use first available
    if (!selectedColor || !availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor, setSelectedColor]);

  const canCreateProduct =
    !isFinalizing &&
    Boolean(blueprintId) &&
    Boolean(printProviderId) &&
    Boolean(selectedColor) &&
    Boolean(selectedImageUrl);

  const handleCreateProduct = async () => {
    if (!blueprintId || !printProviderId) return;
    await createProduct({
      blueprintId,
      printProviderId,
      fabricColor: selectedColor || "",
      size: (selectedSize as SizeType) || DEFAULT_SIZE,
    });
  };

  return (
    <section
      id="step-6"
      className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <CustomizationPreview />
      <CustomizationControls
        colors={availableColors}
        selectedColor={selectedColor}
        sizes={STAMP_SIZES}
        selectedSize={(selectedSize as SizeType) || DEFAULT_SIZE}
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
