"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import type { PlacementParamsType } from "../../../lib/types/stampFlowTypes";
import type { PlacementBounds } from "../../../lib/hooks/useDesignAdjustment";
import { ADJUST_STEP } from "../../../lib/hooks/useDesignAdjustment";

/**
 * PositionControls
 *
 * Arrow buttons (10% steps) + center button + fine-tune x/y sliders for the
 * active print position.
 */

interface PropsI {
  placement: PlacementParamsType;
  bounds: PlacementBounds;
  onNudge: (dx: number, dy: number) => void;
  onCenter: () => void;
  onPlacementChange: (placement: Partial<PlacementParamsType>) => void;
  disabled?: boolean;
}

const ARROW_BUTTON_CLASS =
  "h-9 w-9 rounded-none border border-(--color-stamp-divider) p-0 text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)";

const RANGE_CLASS =
  "flex-1 h-px bg-(--color-stamp-divider) appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-(--color-stamp-gold) [&::-webkit-slider-thumb]:rounded-full";

export function PositionControls({
  placement,
  bounds,
  onNudge,
  onCenter,
  onPlacementChange,
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className={ARROW_BUTTON_CLASS}
          aria-label={t("moveLeft")}
          disabled={disabled}
          onClick={() => onNudge(-ADJUST_STEP, 0)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className={ARROW_BUTTON_CLASS}
          aria-label={t("moveUp")}
          disabled={disabled}
          onClick={() => onNudge(0, -ADJUST_STEP)}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className={ARROW_BUTTON_CLASS}
          aria-label={t("moveDown")}
          disabled={disabled}
          onClick={() => onNudge(0, ADJUST_STEP)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className={ARROW_BUTTON_CLASS}
          aria-label={t("moveRight")}
          disabled={disabled}
          onClick={() => onNudge(ADJUST_STEP, 0)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className={`${ARROW_BUTTON_CLASS} ml-2 w-auto gap-2 px-3`}
          aria-label={t("center")}
          disabled={disabled}
          onClick={onCenter}
        >
          <Crosshair className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {t("center")}
          </span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Label
          htmlFor="placement-x"
          className="w-20 text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe)"
        >
          {t("horizontalLabel")}
        </Label>
        <input
          id="placement-x"
          type="range"
          min={bounds.minX}
          max={bounds.maxX}
          step={0.01}
          value={placement.x}
          disabled={disabled}
          onChange={(e) => onPlacementChange({ x: Number(e.target.value) })}
          className={RANGE_CLASS}
          aria-label={t("horizontalAria")}
        />
      </div>

      <div className="flex items-center gap-4">
        <Label
          htmlFor="placement-y"
          className="w-20 text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe)"
        >
          {t("verticalLabel")}
        </Label>
        <input
          id="placement-y"
          type="range"
          min={bounds.minY}
          max={bounds.maxY}
          step={0.01}
          value={placement.y}
          disabled={disabled}
          onChange={(e) => onPlacementChange({ y: Number(e.target.value) })}
          className={RANGE_CLASS}
          aria-label={t("verticalAria")}
        />
      </div>
    </div>
  );
}
