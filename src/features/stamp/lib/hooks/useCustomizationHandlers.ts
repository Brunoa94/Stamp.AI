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

    // Read the placement configs at click time so the payload always matches
    // the user's latest adjustments without re-memoizing on every nudge.
    // The store is seeded per category by useDesignAdjustment — for socks
    // that's both legs with the chosen face's placement preset — so the
    // user's choices always reach the payload. When the store has nothing
    // (edge case: panel never mounted), the service falls back to the
    // product config's positions with server-side auto-placement.
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
