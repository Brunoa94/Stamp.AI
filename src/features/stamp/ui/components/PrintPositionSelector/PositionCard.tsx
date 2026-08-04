"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

/**
 * PositionCard
 *
 * One selectable print position (front, back, sleeve...). Toggles on click;
 * shows the extra cost when the position isn't included in the base price.
 */

interface PropsI {
  position: string;
  isSelected: boolean;
  additionalCost: number;
  onToggle: () => void;
  disabled?: boolean;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PositionCard({
  position,
  isSelected,
  additionalCost,
  onToggle,
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");
  const label = t(`position.${position}`);

  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={t("positionToggleAria", { position: label })}
      className={`flex h-auto flex-col items-start gap-1 rounded-none border px-4 py-3 transition-all duration-300 ${
        isSelected
          ? "border-(--color-stamp-gold) bg-(--color-stamp-gold)/5"
          : "border-(--color-stamp-divider) hover:border-(--color-stamp-gold)"
      }`}
    >
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
      <Span variant="micro" className="text-[9px] text-(--color-stamp-taupe)/60">
        {additionalCost > 0
          ? t("positionExtraCost", { price: formatCents(additionalCost) })
          : t("positionIncluded")}
      </Span>
    </Button>
  );
}
