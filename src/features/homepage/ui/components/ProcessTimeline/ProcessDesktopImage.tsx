/**
 * ProcessDesktopImage
 *
 * Desktop image card for process steps with slide animation.
 */

import Image from "next/image";
import type { HomeProcessStepType } from "../../../lib/constants/homepageContent";
import type { ProcessStepImageType } from "../../../lib/constants/processStepImages";

interface ProcessDesktopImagePropsI {
  step: HomeProcessStepType;
  imageData: ProcessStepImageType | undefined;
  translateY: number;
  opacity: number;
  zIndex: number;
  isPriority: boolean;
}

export function ProcessDesktopImage({
  step,
  imageData,
  translateY,
  opacity,
  zIndex,
  isPriority,
}: ProcessDesktopImagePropsI) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex,
      }}
    >
      {imageData && (
        <Image
          src={imageData.src}
          alt={imageData.alt}
          width={800}
          height={1000}
          className="w-auto h-auto max-w-full max-h-full rounded-4xl"
          priority={isPriority}
        />
      )}
    </div>
  );
}
