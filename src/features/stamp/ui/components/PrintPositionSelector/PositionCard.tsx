"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { formatPrice } from "@/lib/formatPrice";
import { stampChipVariants } from "../../../lib/variants/stampStudioVariants";
import { PositionGlyph } from "./PositionGlyph";

/**
 * PositionCard
 *
 * One selectable print position (front, back, sleeve...).
 * In "single" mode it behaves like a radio option (picking it deselects the
 * others); in "multiple" mode it toggles independently (socks legs).
 * Shows the extra cost when the position isn't included in the base price.
 */

interface PropsI {
  position: string;
  isSelected: boolean;
  additionalCost: number;
  onToggle: () => void;
  selectionMode?: "single" | "multiple";
  disabled?: boolean;
}

export function PositionCard({
  position,
  isSelected,
  additionalCost,
  onToggle,
  selectionMode = "multiple",
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");
  const label = t(`position.${position}`);
  const isSingle = selectionMode === "single";

  return (
    <Button
      variant="unstyled"
      onClick={onToggle}
      disabled={disabled}
      role={isSingle ? "radio" : undefined}
      aria-checked={isSingle ? isSelected : undefined}
      aria-pressed={isSingle ? undefined : isSelected}
      aria-label={
        isSingle
          ? t("positionSelectAria", { position: label })
          : t("positionToggleAria", { position: label })
      }
      className={stampChipVariants({ selected: isSelected, size: "card" })}
    >
      <Span
        className={
          isSelected
            ? "text-(--color-stamp-gold-text)"
            : "text-(--color-stamp-taupe)"
        }
      >
        <PositionGlyph position={position} />
      </Span>
      <Span
        variant="micro"
        className={
          isSelected
            ? "text-(--color-stamp-chocolate)"
            : "text-(--color-stamp-taupe)"
        }
      >
        {label}
      </Span>
      <Span variant="micro" className="text-(--color-stamp-taupe)">
        {additionalCost > 0
          ? t("positionExtraCost", { price: formatPrice(additionalCost) })
          : t("positionIncluded")}
      </Span>
    </Button>
  );
}
