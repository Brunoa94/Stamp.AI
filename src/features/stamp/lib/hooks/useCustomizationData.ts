import { useMemo } from "react";
import { useBlueprintVariants } from "@/queries/productQueries";
import {
  useStampCustomization,
  useStampProductSelection,
  useStampSelectedImage,
} from "./useStampSelectors";
import { useStampProductCreation } from "./useStampProductCreation";
import {
  getDefaultSizeForProduct,
  sortSizes,
  STAMP_SIZES,
} from "../constants/stampColors";
import { filterDisplayColors } from "@/features/homepage/lib/constants/colorSwatches";
import type { SizeType } from "../types/stampTypes";

/**
 * useCustomizationData
 *
 * Handles data fetching and derived state for the CustomizationSection.
 * Fetches variants from API and computes available colors/sizes.
 */
export function useCustomizationData() {
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

  // Filter colors to only show White and Black if both are available
  // Otherwise show all available colors
  const availableColors = useMemo(() => {
    const allColors = (variants?.colors || []).filter(Boolean);
    return filterDisplayColors(allColors);
  }, [variants?.colors]);

  // Get available sizes from variants API, sorted properly
  // Falls back to standard apparel sizes if API doesn't return sizes
  const availableSizes = useMemo(() => {
    const apiSizes = (variants?.sizes || []).filter(Boolean);
    if (apiSizes.length > 0) {
      return sortSizes(apiSizes) as SizeType[];
    }
    // Fallback to apparel sizes
    return STAMP_SIZES;
  }, [variants?.sizes]);

  // Determine the effective selected size (validated against available)
  const effectiveSelectedSize = useMemo(() => {
    if (selectedSize && availableSizes.includes(selectedSize as SizeType)) {
      return selectedSize as SizeType;
    }
    return getDefaultSizeForProduct(availableSizes) as SizeType;
  }, [selectedSize, availableSizes]);

  // Color selection is only required if colors are available
  const colorRequirementMet = availableColors.length === 0 || Boolean(selectedColor);

  const canCreateProduct = !isFinalizing &&
    Boolean(blueprintId) &&
    Boolean(printProviderId) &&
    colorRequirementMet &&
    Boolean(selectedImageUrl);

  return {
    // Product selection
    blueprintId,
    printProviderId,
    // Colors
    availableColors,
    selectedColor,
    setSelectedColor,
    isLoadingVariants,
    // Sizes
    availableSizes,
    selectedSize,
    setSelectedSize,
    effectiveSelectedSize,
    // Product creation
    createProduct,
    isFinalizing,
    canCreateProduct,
  };
}
