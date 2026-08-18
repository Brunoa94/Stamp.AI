/**
 * ProcessDesktopImage
 *
 * Desktop image card for process steps with slide animation.
 */

import Image from "next/image";
import { Span } from "@/features/ui/span";
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
      className="absolute inset-0"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        zIndex,
      }}
    >
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl ring-2 ring-(--color-stamp-gold)/20">
        {imageData && (
          <Image
            src={imageData.src}
            alt={imageData.alt}
            fill
            sizes="400px"
            className="object-cover"
            priority={isPriority}
          />
        )}
        <div className="absolute bottom-4 left-4 w-10 h-10 flex items-center justify-center bg-(--color-stamp-gold) rounded-full shadow-lg">
          <Span variant="micro" className="text-(--color-stamp-cream)">
            {step.number}
          </Span>
        </div>
      </div>
    </div>
  );
}
