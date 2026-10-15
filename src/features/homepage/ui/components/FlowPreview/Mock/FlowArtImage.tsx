import Image from "next/image";
import { cn } from "@/lib/utils";
import { FLOW_ART_ASSETS } from "@/features/homepage/lib/constants/flowPreview";
import type { FlowArtIdType } from "@/features/homepage/lib/types/flowPreview";

interface PropsI {
  art: FlowArtIdType;
  /** Sets the width; height follows the asset's aspect ratio */
  className?: string;
}

/**
 * FlowArtImage
 *
 * Decorative illustration inside the flow demo (product blanks, sample dog),
 * loaded from public/assets/flow-preview.
 */
export function FlowArtImage({ art, className }: PropsI) {
  const { src, width, height } = FLOW_ART_ASSETS[art];

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      className={cn("h-auto", className)}
    />
  );
}
