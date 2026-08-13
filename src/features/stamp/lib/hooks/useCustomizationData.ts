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
import { shouldShowColorSelection } from "../helpers/productCategoryDetector";
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
  const { blueprintId, printProviderId, selectedProductTitle } = useStampProductSelection();
  const { selectedImageUrl } = useStampSelectedImage();
  const { selectedColor, setSelectedColor, selectedSize, setSelectedSize } =
    useStampCustomization();

  const { data: variants, isLoading: isLoadingVariants } = useBlueprintVariants(
    blueprintId,
    printProviderId,
  );

  // Check if this product type should show color selection
  // Products like mugs, socks, pillows only have one color
  const showColors = shouldShowColorSelection(selectedProductTitle || "");

  // Filter colors to only show White and Black if both are available
  // Otherwise show all available colors
  // For products that don't support color selection, return empty array
  const availableColors = useMemo(() => {
    if (!showColors) return [];
    const allColors = (variants?.colors || []).filter(Boolean);
    return filterDisplayColors(allColors);
  }, [variants?.colors, showColors]);

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

  // Determine effective color: use selected, or auto-select if only one option
  const effectiveSelectedColor = useMemo(() => {
    if (selectedColor && availableColors.includes(selectedColor)) {
      return selectedColor;
    }
    // Auto-select if only one color available
    if (availableColors.length === 1) {
      return availableColors[0];
    }
    return selectedColor;
  }, [selectedColor, availableColors]);

  // Color selection is only required if there are multiple colors to choose from
  // If there's only one color, it will be auto-used
  // If there are no colors, no selection is needed
  const colorRequirementMet =
    availableColors.length === 0 ||
    availableColors.length === 1 ||
    Boolean(selectedColor);

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
    effectiveSelectedColor,
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
