import { PropsWithChildren } from "react";
import { DiagonalBackdrop } from "@/shared/ui/DiagonalBackdrop";
import { PageContainer } from "@/shared/ui/PageContainer";

/**
 * PageHeaderBand
 *
 * Page header panel: a `rounded-2xl` cream panel inside the page gutter
 * (px-4 sm:px-6 lg:px-12, max-w-screen-2xl), with the homepage hero's
 * diagonal photo backdrop inside it (wider band cut, `diagonal-backdrop--band`).
 * Copy inside sits on the photo, so it uses light colours; on xl+ anything
 * past the cut (right side) is back on the cream. `mirrored` flips it on xl+:
 * the photo on the right and the copy on the cream, so the copy is light
 * below xl (full photo) and dark from xl. Pages already offset the fixed
 * header (`pt-24`), so the panel only adds a small top gap.
 */

interface PropsI extends PropsWithChildren {
  src: string;
  /** Crop of the photo, e.g. `object-[center_30%]` to keep a face in the band. */
  imageClassName?: string;
  mirrored?: boolean;
}

export function PageHeaderBand({
  src,
  imageClassName,
  mirrored = false,
  children,
}: PropsI) {
  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-12">
      <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-2xl bg-(--color-stamp-cream)">
        {/* The band opens the page, so its photo is the likely LCP: preload it */}
        <DiagonalBackdrop
          src={src}
          priority
          // The panel stops growing at max-w-screen-2xl, so cap the photo width there
          sizes={
            mirrored
              ? "(min-width: 1632px) 860px, (min-width: 1280px) 56vw, 100vw"
              : "(min-width: 1632px) 984px, (min-width: 1280px) 64vw, 100vw"
          }
          className={mirrored ? "diagonal-backdrop--mirrored" : "diagonal-backdrop--band"}
          imageClassName={imageClassName}
          mirrored={mirrored}
        />
        <div className="relative px-6 py-12 sm:px-10 lg:px-14 xl:py-16">
          <PageContainer>{children}</PageContainer>
        </div>
      </div>
    </div>
  );
}
