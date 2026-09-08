import Image from "next/image";
import type { PlacementParamsType } from "../../../lib/types/stampFlowTypes";

/**
 * DesignOverlay
 *
 * The user's design rendered inside the print-area box. Placement semantics
 * mirror Printify's: x/y are the design center (0-1 within the print area)
 * and scale is the design width relative to the print-area width.
 */

interface PropsI {
  imageUrl: string;
  placement: PlacementParamsType;
  alt: string;
}

export function DesignOverlay({ imageUrl, placement, alt }: PropsI) {
  return (
    <div
      data-testid="design-overlay"
      className="absolute aspect-square"
      style={{
        left: `${placement.x * 100}%`,
        top: `${placement.y * 100}%`,
        width: `${placement.scale * 100}%`,
        transform: `translate(-50%, -50%) rotate(${placement.angle}deg)`,
        transformOrigin: "center center",
      }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 60vw, 25vw"
        className="object-contain"
        draggable={false}
      />
    </div>
  );
}
