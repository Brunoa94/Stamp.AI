"use client";

import type { SafeZone } from "@/lib/printPlacement/types";
import type { PlacementParamsType } from "../../../lib/types/stampFlowTypes";
import type { CategoryType, OrientationType } from "../../../lib/config/silhouetteConfig";
import { PlacementPreview } from "../PlacementPreview/PlacementPreview";

/**
 * DesignPreview
 *
 * Wrapper around PlacementPreview with consistent sizing for the adjustment panel.
 */

interface PropsI {
  imageUrl: string;
  placement: PlacementParamsType;
  productCategory: CategoryType;
  position: string;
  safeZone?: SafeZone;
  orientation?: OrientationType;
}

export function DesignPreview({
  imageUrl,
  placement,
  productCategory,
  position,
  safeZone,
  orientation,
}: PropsI) {
  return (
    <div className="mx-auto w-full max-w-56 lg:max-w-72 pb-6">
      <PlacementPreview
        imageUrl={imageUrl}
        placement={placement}
        productCategory={productCategory}
        position={position}
        safeZone={safeZone ?? { top: 0.03, bottom: 0.03, left: 0.03, right: 0.03 }}
        orientation={orientation}
      />
    </div>
  );
}
