import { useCallback } from "react";
import { AnalyticsService } from "@/services/analyticsService";
import { mapCreateProductEvent } from "@/features/analytics/mappers/stampFlowMappers";
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

    AnalyticsService.track(
      "stamp_create_product",
      mapCreateProductEvent({
        blueprintId,
        color: selectedColor || "",
        size: effectiveSelectedSize,
      })
    );

    // Auto-placement products (mugs: wrap-around print areas) must NOT send
    // client placements — the store's generic seed (scale 1) is far too big
    // for a wide wrap area. Omitting print positions makes the service fall
    // back to config positions and the server fit the image to the area.
    const { selectedProductTitle } = useStampFlowStore.getState();
    const productConfig = getProductConfig(blueprintId, selectedProductTitle);
    if (productConfig.autoPlacement) {
      await createProduct({
        blueprintId,
        printProviderId,
        fabricColor: selectedColor || "",
        size: effectiveSelectedSize,
      });
      return;
    }

    // Read the placement configs at click time so the payload always matches
    // the user's latest adjustments without re-memoizing on every nudge.
    // The store is seeded per category by useDesignAdjustment — for socks
    // that's both legs with the calibrated per-leg presets — so the user's
    // choices always reach the payload. When the store has nothing (edge
    // case: panel never mounted), the service falls back to the product
    // config's positions with server-side auto-placement.
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
