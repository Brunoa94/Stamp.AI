"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { useDesignAdjustment } from "../../../lib/hooks/useDesignAdjustment";
import { PrintPositionSelector } from "../PrintPositionSelector/PrintPositionSelector";
import { PlacementAdjuster } from "../PlacementAdjuster/PlacementAdjuster";
import { PlacementPreview } from "../PlacementPreview/PlacementPreview";

/**
 * DesignAdjustmentPanel
 *
 * Step 6 left panel: pick print positions, see a live CSS preview, and adjust
 * placement (move / size / rotation) per position. State lives in the stamp
 * flow store via useDesignAdjustment.
 */

interface PropsI {
  imageUrl: string;
  disabled?: boolean;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function DesignAdjustmentPanel({ imageUrl, disabled = false }: PropsI) {
  const t = useTranslations("stamp.adjust");
  const {
    productConfig,
    availablePrintPositions,
    printPositionConfigs,
    enabledPositions,
    activeEditPosition,
    setActiveEditPosition,
    activeConfig,
    bounds,
    atBounds,
    togglePrintPosition,
    updateActivePlacement,
    nudgeActivePlacement,
    centerActivePlacement,
    resetPlacementForPosition,
    totalAdditionalCost,
  } = useDesignAdjustment();

  if (!productConfig || !activeConfig) return null;

  return (
    <div className="w-full space-y-10">
      <PrintPositionSelector
        availablePositions={availablePrintPositions}
        printPositionConfigs={printPositionConfigs}
        onTogglePosition={togglePrintPosition}
        disabled={disabled}
      />

      <div className="h-px bg-(--color-stamp-divider)" aria-hidden="true" />

      <PlacementPreview
        imageUrl={imageUrl}
        placement={activeConfig.placement}
        productCategory={productConfig.category}
        position={activeEditPosition}
        safeZone={productConfig.safeZone}
      />

      {/* Hide placement controls for products that don't support manual adjustment (e.g., mugs) */}
      {!productConfig.disablePlacementAdjustment && (
        <PlacementAdjuster
          positions={enabledPositions}
          activePosition={activeEditPosition}
          placement={activeConfig.placement}
          bounds={bounds}
          atBounds={atBounds}
          onPositionChange={setActiveEditPosition}
          onPlacementChange={updateActivePlacement}
          onNudge={nudgeActivePlacement}
          onCenter={centerActivePlacement}
          onReset={() => resetPlacementForPosition(activeEditPosition)}
          disabled={disabled}
        />
      )}

      {totalAdditionalCost > 0 && (
        <Span variant="micro" className="block text-(--color-stamp-taupe)">
          {t("extraCostSummary", { price: formatCents(totalAdditionalCost) })}
        </Span>
      )}
    </div>
  );
}
