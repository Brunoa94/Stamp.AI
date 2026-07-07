"use client";

import { useEffect, useMemo, useState } from "react";
import { useBlueprintVariants } from "@/queries/productQueries";
import { useStampProductCreation } from "../../../lib/hooks/useStampProductCreation";
import {
  useStampProductSelection,
  useStampSelectedImage,
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
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined,
  );
  const [selectedSize, setSelectedSize] = useState<SizeType>(DEFAULT_SIZE);
  const { data: variants, isLoading: isLoadingVariants } = useBlueprintVariants(
    blueprintId,
    printProviderId,
  );

  const availableColors = useMemo(
    () => (variants?.colors || []).filter(Boolean),
    [variants?.colors],
  );

  useEffect(() => {
    if (availableColors.length === 0) {
      setSelectedColor(undefined);
      return;
    }

    setSelectedColor((prev) =>
      prev && availableColors.includes(prev) ? prev : availableColors[0],
    );
  }, [availableColors]);

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
      size: selectedSize,
    });
  };

  return (
    <section
      id="step-6"
      className="h-full grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      <CustomizationPreview />
      <CustomizationControls
        colors={availableColors}
        selectedColor={selectedColor}
        sizes={STAMP_SIZES}
        selectedSize={selectedSize}
        isLoadingColors={isLoadingVariants}
        hasProduct={Boolean(blueprintId)}
        canCreate={canCreateProduct}
        isFinalizing={isFinalizing}
        onSelectColor={setSelectedColor}
        onSelectSize={setSelectedSize}
        onCreateProduct={handleCreateProduct}
      />
    </section>
  );
}
