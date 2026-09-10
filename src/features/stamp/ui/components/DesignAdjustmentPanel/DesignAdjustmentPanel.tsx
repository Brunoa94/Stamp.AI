"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { formatPrice } from "@/lib/formatPrice";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDesignAdjustment } from "../../../lib/hooks/useDesignAdjustment";
import { useStampCustomization } from "../../../lib/hooks/useStampSelectors";
import { getCanvasOrientation } from "@/lib/printPlacement/config";
import { PrintPositionSelector } from "../PrintPositionSelector/PrintPositionSelector";
import { DesignPreview } from "./DesignPreview";
import { DesignAdjuster } from "./DesignAdjuster";
import { DesktopLayout } from "./DesktopLayout";
import { TabletLayout } from "./TabletLayout";
import { MobileLayout } from "./MobileLayout";
import { MobilePreviewLayout } from "./MobilePreviewLayout";

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
 *
 * On mobile flow (mobilePreviewOnly=true): Shows only preview and adjuster
 * without position selector or Disclosures.
 */

interface PropsI {
  imageUrl: string;
  disabled?: boolean;
  /** Mobile flow: show only preview and adjuster, no position selector */
  mobilePreviewOnly?: boolean;
}

export function DesignAdjustmentPanel({
  imageUrl,
  disabled = false,
  mobilePreviewOnly = false,
}: PropsI) {
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
    selectPrintPosition,
    positionSelectionMode,
    updateActivePlacement,
    nudgeActivePlacement,
    centerActivePlacement,
    resetPlacementForPosition,
    totalAdditionalCost,
  } = useDesignAdjustment();
  const { selectedSize } = useStampCustomization();
  const isMdUp = useMediaQuery("(min-width: 768px)", true);
  const isLgUp = useMediaQuery("(min-width: 1024px)", true);

  if (!productConfig || !activeConfig) return null;

  // Determine canvas orientation from selected size
  const isCanvasOrPoster = productConfig.category === "canvas" || productConfig.category === "poster";
  const orientation = isCanvasOrPoster && selectedSize
    ? getCanvasOrientation(selectedSize)
    : undefined;

  const supportsAdjustment = !productConfig.disablePlacementAdjustment;

  const positionSelector = (
    <PrintPositionSelector
      availablePositions={availablePrintPositions}
      printPositionConfigs={printPositionConfigs}
      onTogglePosition={
        positionSelectionMode === "single"
          ? selectPrintPosition
          : togglePrintPosition
      }
      selectionMode={positionSelectionMode}
      disabled={disabled}
    />
  );

  const preview = (
    <DesignPreview
      imageUrl={imageUrl}
      placement={activeConfig.placement}
      productCategory={productConfig.category}
      position={activeEditPosition}
      safeZone={productConfig.safeZone}
      orientation={orientation}
    />
  );

  const adjuster = (
    <DesignAdjuster
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

  // Mobile flow: show only preview and adjuster (no position selector, no Disclosures)
  if (mobilePreviewOnly) {
    return (
      <MobilePreviewLayout
        preview={preview}
        adjuster={adjuster}
        supportsAdjustment={supportsAdjustment}
        totalAdditionalCost={totalAdditionalCost}
      />
    );
  }

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {isLgUp ? (
        <DesktopLayout
          positionSelector={positionSelector}
          preview={preview}
          adjuster={adjuster}
          supportsAdjustment={supportsAdjustment}
        />
      ) : isMdUp ? (
        <TabletLayout
          positionSelector={positionSelector}
          preview={preview}
          adjuster={adjuster}
          supportsAdjustment={supportsAdjustment}
        />
      ) : (
        <MobileLayout
          positionSelector={positionSelector}
          preview={preview}
          adjuster={adjuster}
          supportsAdjustment={supportsAdjustment}
        />
      )}

      {totalAdditionalCost > 0 && (
        <Span variant="micro" className="block text-(--color-stamp-taupe)">
          {t("extraCostSummary", { price: formatPrice(totalAdditionalCost) })}
        </Span>
      )}
    </div>
  );
}
