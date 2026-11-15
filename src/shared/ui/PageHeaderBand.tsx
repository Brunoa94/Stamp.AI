import { PropsWithChildren } from "react";
import { DiagonalBackdrop } from "@/shared/ui/DiagonalBackdrop";
import { PageContainer } from "@/shared/ui/PageContainer";

/**
 * PageHeaderBand
 *
 * Full-bleed page header band with the homepage hero's diagonal photo
 * backdrop behind it (wider band cut, `diagonal-backdrop--band`). Copy inside
 * sits on the photo, so it uses light colours; on xl+ anything past the cut
 * (right side) is back on the off-white. `mirrored` flips it on xl+: the photo
 * on the right and the copy on the off-white, so the copy is light below xl
 * (full-bleed photo) and dark from xl.
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
    <div className="relative overflow-hidden border-b border-(--color-stamp-divider)">
      {/* The band opens the page, so its photo is the likely LCP: preload it */}
      <DiagonalBackdrop
        src={src}
        priority
        sizes={mirrored ? "(min-width: 1280px) 56vw, 100vw" : "(min-width: 1280px) 64vw, 100vw"}
        className={mirrored ? "diagonal-backdrop--mirrored" : "diagonal-backdrop--band"}
        imageClassName={imageClassName}
        mirrored={mirrored}
      />
      <div className="relative px-6 py-14 lg:px-12 xl:px-24 xl:py-20">
        <PageContainer className="mx-auto max-w-screen-2xl">
          {children}
        </PageContainer>
      </div>
    </div>
  );
}
