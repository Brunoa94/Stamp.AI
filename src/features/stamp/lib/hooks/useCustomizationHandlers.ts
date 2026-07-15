import { useCallback } from "react";

/**
 * useCustomizationHandlers
 *
 * Provides memoized event handlers for the CustomizationSection.
 */

interface CreateProductParams {
  blueprintId: number;
  printProviderId: number;
  fabricColor: string;
  size: string;
}

interface UseCustomizationHandlersParams {
  blueprintId: number | undefined;
  printProviderId: number | undefined;
  selectedColor: string | undefined;
  effectiveSelectedSize: string;
  createProduct: (params: CreateProductParams) => Promise<unknown>;
}

export function useCustomizationHandlers({
  blueprintId,
  printProviderId,
  selectedColor,
  effectiveSelectedSize,
  createProduct,
}: UseCustomizationHandlersParams) {
  const handleCreateProduct = useCallback(async () => {
    if (!blueprintId || !printProviderId) return;
    await createProduct({
      blueprintId,
      printProviderId,
      fabricColor: selectedColor || "",
      size: effectiveSelectedSize,
    });
  }, [blueprintId, printProviderId, selectedColor, effectiveSelectedSize, createProduct]);

  return {
    handleCreateProduct,
  };
}
