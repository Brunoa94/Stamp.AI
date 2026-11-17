import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DiagonalBackdrop
 *
 * Decorative editorial photo with a slow Ken Burns drift, filling its
 * positioned parent. On xl+ it's cut on a diagonal behind the copy, edged by a
 * thin gold seam, leaving the off-white on the right; below xl it fills the
 * parent under a darker scrim. Clip paths, scrims and the cut position live in
 * globals.css (`.diagonal-backdrop*`); `className` takes a modifier such as
 * `diagonal-backdrop--band`, `imageClassName` the photo's crop. `mirrored`
 * puts the photo on the right on xl+ (with `diagonal-backdrop--mirrored`).
 * `children` takes the photo's place with other decorative content (the
 * homepage hero's stamp wall), keeping the cut, scrim and seam.
 */

interface PropsI {
  src?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  mirrored?: boolean;
  children?: ReactNode;
}

export function DiagonalBackdrop({
  src,
  sizes,
  priority = false,
  className,
  imageClassName,
  mirrored = false,
  children,
}: PropsI) {
  return (
    <div
      aria-hidden="true"
      className={cn("diagonal-backdrop pointer-events-none absolute inset-0", className)}
    >
      <div className="diagonal-backdrop__photo absolute inset-0 overflow-hidden bg-(--color-stamp-chocolate)">
        {children}
        {src && (
          <div
            className={cn(
              "diagonal-backdrop__photo-img absolute inset-y-0 w-full",
              mirrored
                ? "right-0 xl:w-(--diagonal-photo-width)"
                : "left-0 xl:w-(--diagonal-cut-top)",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={priority}
              sizes={sizes}
              className={cn("object-cover object-top", imageClassName)}
            />
          </div>
        )}
        <div className="diagonal-backdrop__scrim absolute inset-0" />
      </div>
      <div className="diagonal-backdrop__seam absolute inset-0 hidden bg-(--color-stamp-gold) xl:block" />
    </div>
  );
}
