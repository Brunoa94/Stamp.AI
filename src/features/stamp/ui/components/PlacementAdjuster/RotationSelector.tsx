"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { stampChipVariants } from "../../../lib/variants/stampStudioVariants";
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
      <Label variant="section" className="mb-3 text-(--color-stamp-taupe)">
        {t("rotationLabel")}
      </Label>
      <div className="flex flex-wrap items-center gap-2" role="group">
        {ROTATION_PRESETS.map((preset) => {
          const isActive = angle === preset;
          return (
            <Button
              key={preset}
              variant="unstyled"
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={t("rotationAria", { degrees: preset })}
              onClick={() => onAngleChange(preset)}
              className={stampChipVariants({ selected: isActive })}
            >
              {preset}°
            </Button>
          );
        })}
      </div>
    </div>
  );
}
