"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import type { PlacementBounds } from "../../../lib/types/stampFlowTypes";
import { ADJUST_STEP } from "../../../lib/hooks/useDesignAdjustment";

/**
 * ScaleSlider
 *
 * Design size control: −/+ buttons in 10% steps plus a fine-tune slider.
 */

interface PropsI {
  scale: number;
  bounds: PlacementBounds;
  onScaleChange: (scale: number) => void;
  disabled?: boolean;
}

const STEP_BUTTON_CLASS =
  "h-9 w-9 rounded-none border border-(--color-stamp-divider) p-0 text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)";

export function ScaleSlider({
  scale,
  bounds,
  onScaleChange,
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div>
      <Label
        htmlFor="placement-scale"
        className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe)"
      >
        {t("sizeLabel")}
      </Label>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className={STEP_BUTTON_CLASS}
          aria-label={t("scaleDown")}
          disabled={disabled}
          onClick={() => onScaleChange(scale - ADJUST_STEP)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <input
          id="placement-scale"
          type="range"
          min={bounds.minScale}
          max={bounds.maxScale}
          step={0.01}
          value={scale}
          disabled={disabled}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="flex-1 h-px bg-(--color-stamp-divider) appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-(--color-stamp-gold) [&::-webkit-slider-thumb]:rounded-full"
          aria-label={t("scaleAria")}
        />
        <Button
          variant="ghost"
          className={STEP_BUTTON_CLASS}
          aria-label={t("scaleUp")}
          disabled={disabled}
          onClick={() => onScaleChange(scale + ADJUST_STEP)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Span variant="label" className="w-12 text-right text-[10px] text-(--color-stamp-taupe)">
          {Math.round(scale * 100)}%
        </Span>
      </div>
    </div>
  );
}
