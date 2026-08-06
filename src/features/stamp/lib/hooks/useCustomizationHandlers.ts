import { useCallback } from "react";
import { useStampFlowStore } from "../stores/stampFlowStore";
import { buildPrintPositionsPayload } from "./useDesignAdjustment";
import { getProductConfig } from "@/lib/printPlacement/config";
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
  scale?: number;
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

    // Get product config to check if placement adjustment is disabled
    const productConfig = getProductConfig(blueprintId);

    // For products with disabled placement (mugs, socks), don't send print positions
    // from the store - let the server use all available positions from the config
    if (productConfig.disablePlacementAdjustment) {
      await createProduct({
        blueprintId,
        printProviderId,
        fabricColor: selectedColor || "",
        size: effectiveSelectedSize,
        // No printPositions - service will use all positions from config
      });
      return;
    }

    // Read the placement configs at click time so the payload always matches
    // the user's latest adjustments without re-memoizing on every nudge.
    const printPositions = buildPrintPositionsPayload(
      useStampFlowStore.getState().printPositionConfigs,
    );
    // Get the primary position's scale for idempotency key
    const primaryScale = printPositions.length > 0
      ? printPositions[0].placement.scale
      : undefined;
    await createProduct({
      blueprintId,
      printProviderId,
      fabricColor: selectedColor || "",
      size: effectiveSelectedSize,
      scale: primaryScale,
      ...(printPositions.length > 0 ? { printPositions } : {}),
    });
  }, [blueprintId, printProviderId, selectedColor, effectiveSelectedSize, createProduct]);

  return {
    handleCreateProduct,
  };
}
