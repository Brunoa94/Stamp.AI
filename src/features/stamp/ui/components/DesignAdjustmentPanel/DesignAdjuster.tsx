"use client";

import type { PlacementParamsType, PlacementBounds } from "../../../lib/types/stampFlowTypes";
import { PlacementAdjuster } from "../PlacementAdjuster/PlacementAdjuster";

/**
 * DesignAdjuster
 *
 * Wrapper around PlacementAdjuster for the adjustment panel.
 */

interface PropsI {
  positions: string[];
  activePosition: string;
  placement: PlacementParamsType;
  bounds: PlacementBounds;
  atBounds: boolean;
  onPositionChange: (position: string) => void;
  onPlacementChange: (placement: Partial<PlacementParamsType>) => void;
  onNudge: (dx: number, dy: number) => void;
  onCenter: () => void;
  onReset: () => void;
  disabled?: boolean;
  scaleOnly?: boolean;
}

export function DesignAdjuster({
  positions,
  activePosition,
  placement,
  bounds,
  atBounds,
  onPositionChange,
  onPlacementChange,
  onNudge,
  onCenter,
  onReset,
  disabled = false,
  scaleOnly = false,
}: PropsI) {
  return (
    <PlacementAdjuster
      positions={positions}
      activePosition={activePosition}
      placement={placement}
      bounds={bounds}
      atBounds={atBounds}
      onPositionChange={onPositionChange}
      onPlacementChange={onPlacementChange}
      onNudge={onNudge}
      onCenter={onCenter}
      onReset={onReset}
      disabled={disabled}
      scaleOnly={scaleOnly}
    />
  );
}
