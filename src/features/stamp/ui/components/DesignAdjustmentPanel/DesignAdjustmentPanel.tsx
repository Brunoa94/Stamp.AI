"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { formatPrice } from "@/lib/formatPrice";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDesignAdjustment } from "../../../lib/hooks/useDesignAdjustment";
import { useStampCustomization } from "../../../lib/hooks/useStampSelectors";
import { getCanvasOrientation } from "@/lib/printPlacement/config";
import { Disclosure } from "../Disclosure/Disclosure";
import { PrintPositionSelector } from "../PrintPositionSelector/PrintPositionSelector";
import { PlacementAdjuster } from "../PlacementAdjuster/PlacementAdjuster";
import { PlacementPreview } from "../PlacementPreview/PlacementPreview";

/**
 * DesignAdjustmentPanel
 *
 * Step 6 left panel: pick print positions, see a live CSS preview, and adjust
 * placement (move / size / rotation) per position. State lives in the stamp
 * flow store via useDesignAdjustment.
 *
 * The fine-grained placement controls live behind an "Adjust placement"
 * disclosure so the step fits the viewport; on small screens the position
 * cards and the preview fold away too.
 */

interface PropsI {
  imageUrl: string;
  disabled?: boolean;
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
  const { selectedSize } = useStampCustomization();
  const isMdUp = useMediaQuery("(min-width: 768px)", true);

  if (!productConfig || !activeConfig) return null;

  // Determine canvas orientation from selected size
  const isCanvasOrPoster = productConfig.category === "canvas" || productConfig.category === "poster";
  const orientation = isCanvasOrPoster && selectedSize
    ? getCanvasOrientation(selectedSize)
    : undefined;

  const positionSelector = (
    <PrintPositionSelector
      availablePositions={availablePrintPositions}
      printPositionConfigs={printPositionConfigs}
      onTogglePosition={togglePrintPosition}
      disabled={disabled}
    />
  );

  const preview = (
    <div className="mx-auto w-full max-w-56 pb-6">
      <PlacementPreview
        imageUrl={imageUrl}
        placement={activeConfig.placement}
        productCategory={productConfig.category}
        position={activeEditPosition}
        safeZone={productConfig.safeZone}
        orientation={orientation}
      />
    </div>
  );

  const adjuster = (
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
      scaleOnly={productConfig.scaleOnly}
    />
  );

  const supportsAdjustment = !productConfig.disablePlacementAdjustment;

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {isMdUp ? (
        <>
          {/* md+: positions and preview side by side, fine controls folded */}
          <div className={supportsAdjustment ? "grid gap-6 md:grid-cols-2 items-center" : undefined}>
            {positionSelector}
            {supportsAdjustment && preview}
          </div>
          {supportsAdjustment && (
            <Disclosure key={`adjust-${isMdUp}`} label={t("adjustToggle")}>
              {adjuster}
            </Disclosure>
          )}
        </>
      ) : (
        <>
          {/* mobile: everything folded so the step fits the screen */}
          <Disclosure label={t("positionsTitle")}>{positionSelector}</Disclosure>
          {supportsAdjustment && (
            <Disclosure label={t("previewToggle")}>
              {preview}
              <div className="mt-6">{adjuster}</div>
            </Disclosure>
          )}
        </>
      )}

      {totalAdditionalCost > 0 && (
        <Span variant="micro" className="block text-(--color-stamp-taupe)">
          {t("extraCostSummary", { price: formatPrice(totalAdditionalCost) })}
        </Span>
      )}
    </div>
  );
}
