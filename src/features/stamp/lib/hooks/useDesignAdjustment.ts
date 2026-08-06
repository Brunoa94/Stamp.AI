"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  getProductConfig,
  MIN_SCALE,
  sockLegPlacement,
} from "@/lib/printPlacement/config";
import type { SafeZone } from "@/lib/printPlacement/types";
import { useStampPrintPlacement, useStampProductSelection } from "./useStampSelectors";
import type {
  PlacementBounds,
  PlacementParamsType,
  PrintPositionConfigType,
} from "../types/stampFlowTypes";

/**
 * useDesignAdjustment
 *
 * Orchestrates the Step 6 design adjustment panel:
 * - Seeds available print positions + default placement from the product
 *   config whenever the selected blueprint changes.
 * - Exposes clamped placement updates so the design center stays inside the
 *   product's safe zone (the server still runs the authoritative geometric
 *   check at creation time).
 */

/** Upper bound for the client-side scale control. */
export const MAX_SCALE = 1.5;

/** Increment used by the arrow / scale buttons (plan: 10%). */
export const ADJUST_STEP = 0.1;

/** Rotation presets offered in the UI. */
export const ROTATION_PRESETS = [0, 90, 180, 270] as const;

export function boundsFromSafeZone(safeZone: SafeZone): PlacementBounds {
  return {
    minX: safeZone.left,
    maxX: 1 - safeZone.right,
    minY: safeZone.top,
    maxY: 1 - safeZone.bottom,
    minScale: MIN_SCALE,
    maxScale: MAX_SCALE,
  };
}

export function clampPlacement(
  placement: PlacementParamsType,
  bounds: PlacementBounds,
): PlacementParamsType {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  return {
    x: clamp(placement.x, bounds.minX, bounds.maxX),
    y: clamp(placement.y, bounds.minY, bounds.maxY),
    scale: clamp(placement.scale, bounds.minScale, bounds.maxScale),
    angle: ((placement.angle % 360) + 360) % 360,
  };
}

export function isAtBounds(
  placement: PlacementParamsType,
  bounds: PlacementBounds,
): boolean {
  return (
    placement.x <= bounds.minX ||
    placement.x >= bounds.maxX ||
    placement.y <= bounds.minY ||
    placement.y >= bounds.maxY
  );
}

/**
 * Build the API payload for all enabled positions.
 */
export function buildPrintPositionsPayload(
  configs: Record<string, PrintPositionConfigType>,
): { position: string; placement: PlacementParamsType }[] {
  return Object.values(configs)
    .filter((config) => config.enabled)
    .map(({ position, placement }) => ({ position, placement: { ...placement } }));
}

export function useDesignAdjustment() {
  const { blueprintId, selectedProductTitle } = useStampProductSelection();
  const {
    availablePrintPositions,
    printPositionConfigs,
    setPrintPositionConfig,
    togglePrintPosition,
    activeEditPosition,
    setActiveEditPosition,
    resetPlacementForPosition,
    initializePrintPositions,
    defaultPlacement,
    placementSeededBlueprintId,
  } = useStampPrintPlacement();

  const productConfig = useMemo(
    () => (blueprintId ? getProductConfig(blueprintId, selectedProductTitle) : undefined),
    [blueprintId, selectedProductTitle],
  );

  // Seed positions whenever the selected product changes. Guarded by the
  // blueprint the store was last seeded for: re-mounting Step 6 (navigating
  // back and forth) keeps the user's adjustments, while selecting a
  // different product — even one with identical positions — resets the
  // placement to that product's defaults.
  useEffect(() => {
    if (!productConfig || !blueprintId) return;
    if (placementSeededBlueprintId === blueprintId) return;
    const isSocks = productConfig.category === "socks";
    // Socks: both legs enabled, design visually centered on each leg (the
    // blueprint only prints the front panel; each leg has its own calibrated
    // x — see SOCK_LEG_PLACEMENTS).
    const expectedDefault: PlacementParamsType = isSocks
      ? sockLegPlacement(productConfig.positions[0] ?? "left_leg")
      : { x: 0.5, y: productConfig.anchorY ?? 0.5, scale: 1, angle: 0 };
    initializePrintPositions(productConfig.positions, expectedDefault, {
      blueprintId,
      ...(isSocks
        ? {
            enableAll: true,
            placements: Object.fromEntries(
              productConfig.positions.map((position) => [
                position,
                sockLegPlacement(position),
              ]),
            ),
          }
        : {}),
    });
  }, [
    productConfig,
    blueprintId,
    placementSeededBlueprintId,
    initializePrintPositions,
  ]);

  const bounds = useMemo(
    () =>
      boundsFromSafeZone(
        productConfig?.safeZone ?? { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 },
      ),
    [productConfig],
  );

  const activeConfig: PrintPositionConfigType | undefined =
    printPositionConfigs[activeEditPosition];

  const enabledPositions = useMemo(
    () =>
      availablePrintPositions.filter(
        (position) => printPositionConfigs[position]?.enabled,
      ),
    [availablePrintPositions, printPositionConfigs],
  );

  // Keep the active edit position pointed at an enabled position.
  useEffect(() => {
    if (enabledPositions.length === 0) return;
    if (!enabledPositions.includes(activeEditPosition)) {
      setActiveEditPosition(enabledPositions[0]);
    }
  }, [enabledPositions, activeEditPosition, setActiveEditPosition]);

  const updateActivePlacement = useCallback(
    (partial: Partial<PlacementParamsType>) => {
      const current = printPositionConfigs[activeEditPosition];
      if (!current) return;
      let next = clampPlacement({ ...current.placement, ...partial }, bounds);
      // When scaleOnly is true, force centered placement (only allow scale changes)
      if (productConfig?.scaleOnly) {
        const anchorY = productConfig.anchorY ?? 0.5;
        next = { ...next, x: 0.5, y: anchorY, angle: 0 };
      }
      setPrintPositionConfig(activeEditPosition, { placement: next });
    },
    [printPositionConfigs, activeEditPosition, bounds, setPrintPositionConfig, productConfig],
  );

  const nudgeActivePlacement = useCallback(
    (dx: number, dy: number) => {
      const current = printPositionConfigs[activeEditPosition];
      if (!current) return;
      updateActivePlacement({
        x: current.placement.x + dx,
        y: current.placement.y + dy,
      });
    },
    [printPositionConfigs, activeEditPosition, updateActivePlacement],
  );

  const centerActivePlacement = useCallback(() => {
    updateActivePlacement({ x: 0.5, y: defaultPlacement.y });
  }, [updateActivePlacement, defaultPlacement.y]);

  const totalAdditionalCost = useMemo(
    () =>
      Object.values(printPositionConfigs)
        .filter((config) => config.enabled)
        .reduce((sum, config) => sum + config.additionalCost, 0),
    [printPositionConfigs],
  );

  return {
    productConfig,
    availablePrintPositions,
    printPositionConfigs,
    enabledPositions,
    activeEditPosition,
    setActiveEditPosition,
    activeConfig,
    bounds,
    atBounds: activeConfig ? isAtBounds(activeConfig.placement, bounds) : false,
    togglePrintPosition,
    updateActivePlacement,
    nudgeActivePlacement,
    centerActivePlacement,
    resetPlacementForPosition,
    totalAdditionalCost,
  };
}
