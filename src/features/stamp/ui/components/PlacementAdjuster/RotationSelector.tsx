"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { ROTATION_PRESETS } from "../../../lib/hooks/useDesignAdjustment";

/**
 * RotationSelector
 *
 * Preset rotation buttons (0/90/180/270 degrees) for the active position.
 */

interface PropsI {
  angle: number;
  onAngleChange: (angle: number) => void;
  disabled?: boolean;
}

export function RotationSelector({
  angle,
  onAngleChange,
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  return (
    <div>
      <Label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
        {t("rotationLabel")}
      </Label>
      <div className="flex items-center gap-2" role="group">
        {ROTATION_PRESETS.map((preset) => {
          const isActive = angle === preset;
          return (
            <Button
              key={preset}
              variant="ghost"
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={t("rotationAria", { degrees: preset })}
              onClick={() => onAngleChange(preset)}
              className={`h-9 rounded-none border px-3 text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "border-(--color-stamp-gold) bg-(--color-stamp-gold)/5 text-(--color-stamp-chocolate)"
                  : "border-(--color-stamp-divider) text-(--color-stamp-taupe) hover:border-(--color-stamp-gold)"
              }`}
            >
              {preset}°
            </Button>
          );
        })}
      </div>
    </div>
  );
}
