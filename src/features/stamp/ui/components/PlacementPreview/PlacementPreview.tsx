"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import { placementPreviewVariants } from "@/features/stamp/lib/variants/placementPreviewVariants";
import type { SafeZone } from "@/lib/printPlacement/types";
import type { PlacementParamsType } from "../../../lib/types/stampFlowTypes";
import type { CategoryType, OrientationType } from "../../../lib/config/silhouetteConfig";
import { getAreaRect, SCALE_MULTIPLIERS } from "../../../lib/config/printAreaConfig";
import { ProductSilhouette } from "./ProductSilhouette";
import { DesignOverlay } from "./DesignOverlay";

/**
 * PlacementPreview
 *
 * CSS-only live preview: product silhouette + dashed print-area box +
 * safe-zone inset + the design positioned per the current placement.
 * It approximates the final print for instant feedback; the authoritative
 * placement check still runs server-side at product creation.
 */

interface PropsI {
  imageUrl: string;
  placement: PlacementParamsType;
  productCategory: CategoryType;
  position: string;
  safeZone: SafeZone;
  /** For canvas/poster: controls the silhouette orientation */
  orientation?: OrientationType;
}

export function PlacementPreview({
  imageUrl,
  placement,
  productCategory,
  position,
  safeZone,
  orientation,
}: PropsI) {
  const t = useTranslations("stamp.adjust");
  const area = getAreaRect(productCategory, position);

  // Apply scale multiplier for categories where preview differs from print
  const scaleMultiplier = SCALE_MULTIPLIERS[productCategory] ?? 1;
  const adjustedPlacement = {
    ...placement,
    scale: placement.scale * scaleMultiplier,
  };

  // Only canvas/poster frames follow the orientation; everything else is portrait
  const isCanvasOrPoster = productCategory === "canvas" || productCategory === "poster";
  const frameOrientation = isCanvasOrPoster ? orientation : undefined;

  return (
    <div
      data-testid="placement-preview"
      className={placementPreviewVariants({ orientation: frameOrientation })}
    >
      <ProductSilhouette
        category={productCategory}
        orientation={orientation}
        position={position}
      />

      {/* Print area boundary */}
      <div
        data-testid="print-area"
        className="absolute overflow-hidden border border-dashed border-(--color-stamp-taupe)/40"
        style={area}
        aria-label={t("printAreaLabel")}
      >
        {/* Safe zone inset */}
        <div
          data-testid="safe-zone"
          aria-hidden="true"
          className="absolute border border-dotted border-(--color-stamp-gold)/50"
          style={{
            left: `${safeZone.left * 100}%`,
            right: `${safeZone.right * 100}%`,
            top: `${safeZone.top * 100}%`,
            bottom: `${safeZone.bottom * 100}%`,
          }}
        />

        {imageUrl && (
          <DesignOverlay
            imageUrl={imageUrl}
            placement={adjustedPlacement}
            alt={t("previewAlt")}
          />
        )}
      </div>

      <div className="absolute inset-x-0 -bottom-6 text-center">
        <Span variant="micro" className="text-[9px] text-(--color-stamp-taupe)/60">
          {t(`position.${position}`)}
        </Span>
      </div>
    </div>
  );
}
