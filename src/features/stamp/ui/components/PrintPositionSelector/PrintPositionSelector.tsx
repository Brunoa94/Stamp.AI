"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type { PrintPositionConfigType } from "../../../lib/types/stampFlowTypes";
import { PositionCard } from "./PositionCard";

/**
 * PrintPositionSelector
 *
 * Grid of print positions for the selected product. Positions come from the
 * product's blueprint config; each card shows its extra cost.
 *
 * In "single" mode (apparel, totes...) the grid is a radio group: exactly one
 * position prints and picking one deselects the rest. In "multiple" mode
 * (socks) each position toggles independently.
 */

interface PropsI {
  availablePositions: string[];
  printPositionConfigs: Record<string, PrintPositionConfigType>;
  onTogglePosition: (position: string) => void;
  selectionMode?: "single" | "multiple";
  disabled?: boolean;
}

export function PrintPositionSelector({
  availablePositions,
  printPositionConfigs,
  onTogglePosition,
  selectionMode = "multiple",
  disabled = false,
}: PropsI) {
  const t = useTranslations("stamp.adjust");

  if (availablePositions.length === 0) return null;

  const isSingle = selectionMode === "single";

  return (
    <div>
      <Span
        variant="micro"
        className="mb-1 block tracking-widest text-(--color-stamp-taupe)"
      >
        {t("positionsTitle")}
      </Span>
      <Span
        variant="micro"
        className="mb-4 block text-[9px] normal-case tracking-normal text-(--color-stamp-taupe)/60"
      >
        {isSingle ? t("positionsHelpSingle") : t("positionsHelp")}
      </Span>
      <div
        role={isSingle ? "radiogroup" : undefined}
        aria-label={isSingle ? t("positionsGroupAria") : undefined}
        className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2"
      >
        {availablePositions.map((position) => {
          const config = printPositionConfigs[position];
          return (
            <PositionCard
              key={position}
              position={position}
              isSelected={Boolean(config?.enabled)}
              additionalCost={config?.additionalCost ?? 0}
              onToggle={() => onTogglePosition(position)}
              selectionMode={selectionMode}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
}
