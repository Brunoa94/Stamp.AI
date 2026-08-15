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
import { getProductConfig } from "@/lib/printPlacement/config";
import type { SizeType } from "../types/stampTypes";

/**
 * Fixed colors for product categories that don't allow user color selection.
 * These products always use a specific color regardless of what the API returns.
 */
const FIXED_COLOR_BY_CATEGORY: Record<string, string> = {
  mug: "White",
  socks: "White",
  canvas: "White",
  tote: "Black", // Default for tote bags (most versatile)
  pillow: "White",
};

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

  // Determine product category and if it has a fixed color
  const productCategory = useMemo(() => {
    if (!blueprintId) return null;
    return getProductConfig(blueprintId).category;
  }, [blueprintId]);

  const fixedColor = useMemo(() => {
    if (!productCategory) return null;
    return FIXED_COLOR_BY_CATEGORY[productCategory] || null;
  }, [productCategory]);

  // For products with fixed colors (mugs, socks, canvas, tote), don't show color selection
  // Otherwise filter colors to only show White and Black if both are available
  const availableColors = useMemo(() => {
    // If product has a fixed color, return empty array (no user selection needed)
    if (fixedColor) {
      return [];
    }
    const allColors = (variants?.colors || []).filter(Boolean);
    return filterDisplayColors(allColors);
  }, [variants?.colors, fixedColor]);

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

  // Determine effective color:
  // 1. For fixed-color products (mugs, socks, canvas, tote), always use the fixed color
  // 2. Otherwise use selected color, or auto-select if only one option
  const effectiveSelectedColor = useMemo(() => {
    // Fixed color products always use their designated color
    if (fixedColor) {
      return fixedColor;
    }
    // User-selected color if valid
    if (selectedColor && availableColors.includes(selectedColor)) {
      return selectedColor;
    }
    // Auto-select if only one color available
    if (availableColors.length === 1) {
      return availableColors[0];
    }
    return selectedColor;
  }, [selectedColor, availableColors, fixedColor]);

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
