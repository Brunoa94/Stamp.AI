import { useCallback } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";
import { buildPrintPositionsPayload } from "./useDesignAdjustment";
import type { PlacementParamsType } from "../types/stampFlowTypes";

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
  printPositions?: { position: string; placement: PlacementParamsType }[];
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
    // Read the placement configs at click time so the payload always matches
    // the user's latest adjustments without re-memoizing on every nudge.
    const printPositions = buildPrintPositionsPayload(
      useStampFlowStore.getState().printPositionConfigs,
    );
    await createProduct({
      blueprintId,
      printProviderId,
      fabricColor: selectedColor || "",
      size: effectiveSelectedSize,
      ...(printPositions.length > 0 ? { printPositions } : {}),
    });
  }, [blueprintId, printProviderId, selectedColor, effectiveSelectedSize, createProduct]);

  return {
    handleCreateProduct,
  };
}
