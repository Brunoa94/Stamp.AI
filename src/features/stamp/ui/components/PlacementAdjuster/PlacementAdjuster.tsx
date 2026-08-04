"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import type { PlacementParamsType } from "../../../lib/types/stampFlowTypes";
import type { PlacementBounds } from "../../../lib/hooks/useDesignAdjustment";
import { PositionControls } from "./PositionControls";
import { ScaleSlider } from "./ScaleSlider";
import { RotationSelector } from "./RotationSelector";

/**
 * PlacementAdjuster
 *
 * Full adjustment control block for one print position: position picker
 * (when several positions are enabled), move/center controls, size, rotation
 * and reset. Values are clamped to the product safe zone by the caller.
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
}

export function PlacementAdjuster({
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
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div className="space-y-6">
      {positions.length > 1 && (
        <div className="flex items-center gap-3">
          <Label
            htmlFor="active-position"
            className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe)"
          >
            {t("editingLabel")}
          </Label>
          <select
            id="active-position"
            value={activePosition}
            disabled={disabled}
            onChange={(e) => onPositionChange(e.target.value)}
            aria-label={t("editingSelectAria")}
            className="border border-(--color-stamp-divider) bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-chocolate) focus:border-(--color-stamp-gold) focus:outline-none"
          >
            {positions.map((position) => (
              <option key={position} value={position}>
                {t(`position.${position}`)}
              </option>
            ))}
          </select>
        </div>
      )}

      <PositionControls
        placement={placement}
        bounds={bounds}
        onNudge={onNudge}
        onCenter={onCenter}
        onPlacementChange={onPlacementChange}
        disabled={disabled}
      />

      <ScaleSlider
        scale={placement.scale}
        bounds={bounds}
        onScaleChange={(scale) => onPlacementChange({ scale })}
        disabled={disabled}
      />

      <RotationSelector
        angle={placement.angle}
        onAngleChange={(angle) => onPlacementChange({ angle })}
        disabled={disabled}
      />

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          disabled={disabled}
          onClick={onReset}
          aria-label={t("resetAria", { position: t(`position.${activePosition}`) })}
          className="h-9 gap-2 rounded-none border border-(--color-stamp-divider) px-3 text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("reset")}
        </Button>

        {atBounds && (
          <span
            role="status"
            className="flex items-center gap-2 text-(--color-stamp-taupe)"
          >
            <TriangleAlert
              className="h-3.5 w-3.5 text-(--color-stamp-gold)"
              aria-hidden="true"
            />
            <Span variant="micro" className="text-[9px]">
              {t("safeZoneWarning")}
            </Span>
          </span>
        )}
      </div>
    </div>
  );
}
