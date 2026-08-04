"use client";

import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import type { SafeZone } from "@/lib/printPlacement/types";
import type { PlacementParamsType } from "../../../lib/types/stampFlowTypes";
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

type CategoryType = "apparel" | "tote" | "mug" | "poster" | "pillow" | "canvas" | "socks";

interface PropsI {
  imageUrl: string;
  placement: PlacementParamsType;
  productCategory: CategoryType;
  position: string;
  safeZone: SafeZone;
}

interface AreaRect {
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * Approximate print-area rectangle per position, as percentages of the
 * silhouette container. Tuned for the simple apparel/tote silhouettes.
 */
const APPAREL_AREAS: Record<string, AreaRect> = {
  front: { left: "27%", top: "24%", width: "46%", height: "52%" },
  back: { left: "27%", top: "24%", width: "46%", height: "52%" },
  neck: { left: "40%", top: "10%", width: "20%", height: "10%" },
  left_sleeve: { left: "4%", top: "22%", width: "15%", height: "13%" },
  right_sleeve: { left: "81%", top: "22%", width: "15%", height: "13%" },
};

const TOTE_AREAS: Record<string, AreaRect> = {
  front: { left: "22%", top: "32%", width: "56%", height: "52%" },
  back: { left: "22%", top: "32%", width: "56%", height: "52%" },
};

const MUG_AREAS: Record<string, AreaRect> = {
  front: { left: "22%", top: "28%", width: "50%", height: "55%" },
};

const CANVAS_AREAS: Record<string, AreaRect> = {
  front: { left: "14%", top: "18%", width: "72%", height: "68%" },
};

const SOCKS_AREAS: Record<string, AreaRect> = {
  front: { left: "15%", top: "20%", width: "70%", height: "50%" },
};

function getAreaRect(category: CategoryType, position: string): AreaRect {
  switch (category) {
    case "tote":
      return TOTE_AREAS[position] ?? TOTE_AREAS.front;
    case "mug":
      return MUG_AREAS[position] ?? MUG_AREAS.front;
    case "canvas":
    case "poster":
      return CANVAS_AREAS[position] ?? CANVAS_AREAS.front;
    case "socks":
      return SOCKS_AREAS[position] ?? SOCKS_AREAS.front;
    default:
      return APPAREL_AREAS[position] ?? APPAREL_AREAS.front;
  }
}

export function PlacementPreview({
  imageUrl,
  placement,
  productCategory,
  position,
  safeZone,
}: PropsI) {
  const t = useTranslations("stamp.adjust");
  const area = getAreaRect(productCategory, position);

  return (
    <div
      data-testid="placement-preview"
      className="relative mx-auto aspect-5/6 w-full max-w-sm"
    >
      <ProductSilhouette category={productCategory} />

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
            placement={placement}
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
