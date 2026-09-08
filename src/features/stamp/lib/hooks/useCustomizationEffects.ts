import { useEffect } from "react";
import { getDefaultSizeForProduct } from "../constants/stampColors";
import type { SizeType } from "../types/stampTypes";

/**
 * useCustomizationEffects
 *
 * Handles side effects for auto-selecting default color and size
 * when variants data loads from the API.
 */

interface UseCustomizationEffectsParams {
  availableColors: string[];
  selectedColor: string | undefined;
  setSelectedColor: (color: string | undefined) => void;
  availableSizes: SizeType[];
  selectedSize: string | undefined;
  setSelectedSize: (size: string) => void;
}

export function useCustomizationEffects({
  availableColors,
  selectedColor,
  setSelectedColor,
  availableSizes,
  selectedSize,
  setSelectedSize,
}: UseCustomizationEffectsParams) {
  // Auto-select appropriate default size when sizes load
  useEffect(() => {
    if (availableSizes.length === 0) return;

    // If no size selected, or current selection is not in available sizes, pick default
    if (!selectedSize || !availableSizes.includes(selectedSize as SizeType)) {
      const defaultSize = getDefaultSizeForProduct(availableSizes);
      setSelectedSize(defaultSize);
    }
  }, [availableSizes, selectedSize, setSelectedSize]);

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
}
