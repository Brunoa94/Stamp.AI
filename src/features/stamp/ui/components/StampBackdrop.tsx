import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { STAMP_BACKDROP_PHOTOS } from "../../lib/constants/stampBackdrops";
import {
  getStampBackdropIndex,
  isStampBackdropPhotoMounted,
  isStampBackdropVisible,
} from "../../lib/helpers/stampBackdropHelpers";

/**
 * StampBackdrop
 *
 * Fixed editorial photo behind the stamp canvas, in the homepage hero's
 * diagonal style (Ken Burns drift, chocolate scrim), with a clean edge and
 * no gold seam. Each phase of the flow has its own photo; when a step
 * enters a new phase the photos crossfade. The hero step (00) keeps its own
 * photo, so the backdrop is faded out there and fades in on step 01. Below md it's a short strip above
 * the steps; from md it's anchored to the right, under the steps sidebar, and
 * its edge runs through the middle of the steps' right column (from lg it
 * starts on the sidebar's left border)
 * (`.stamp-backdrop*` in globals.css).
 */

interface PropsI {
  currentStep: number;
}

export function StampBackdrop({ currentStep }: PropsI) {
  const activeIndex = getStampBackdropIndex(currentStep, STAMP_BACKDROP_PHOTOS);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "stamp-backdrop pointer-events-none absolute inset-x-0 top-24 h-32 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none md:bottom-0 md:h-auto",
        isStampBackdropVisible(currentStep) ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="stamp-backdrop__photo absolute inset-0 overflow-hidden bg-(--color-stamp-chocolate)">
        <div className="diagonal-backdrop__photo-img absolute inset-y-0 right-0 w-full md:w-1/2 lg:w-[calc(17rem+10%)]">
          {/* No priority: the backdrop is hidden on step 00, where the hero image is the LCP */}
          {STAMP_BACKDROP_PHOTOS.map((photo, index) =>
            isStampBackdropPhotoMounted(index, activeIndex) ? (
              <Image
                key={photo.src}
                src={photo.src}
                alt=""
                fill
                style={{ "--stamp-backdrop-focus": photo.focus } as CSSProperties}
                sizes="(min-width: 1024px) calc(17rem + 10vw), (min-width: 768px) 50vw, 100vw"
                className={cn(
                  "object-cover object-top lg:object-(--stamp-backdrop-focus) transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
                  index === activeIndex ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null,
          )}
        </div>
        <div className="stamp-backdrop__scrim absolute inset-0" />
      </div>
    </div>
  );
}
