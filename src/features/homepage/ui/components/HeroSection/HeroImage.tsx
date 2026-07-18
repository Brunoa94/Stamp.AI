/**
 * HeroImage
 *
 * Hero section product image with carousel effect and parallax.
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface HeroImageProps {
  currentImage: string;
  isTransitioning: boolean;
  translateY: number;
  opacity: number;
}

export function HeroImage({
  currentImage,
  isTransitioning,
  translateY,
  opacity,
}: HeroImageProps) {
  const t = useTranslations("home.hero");

  return (
    <div
      className="hero-scroll-scale hidden lg:col-span-5 lg:block"
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div className="group relative">
        <div
          aria-hidden
          className={cn(
            "absolute -bottom-4 -right-4 h-full w-full border border-(--color-stamp-gold) transition-all duration-700 ease-in-out group-hover:-bottom-6 group-hover:-right-6",
            isTransitioning ? "scale-90 opacity-50" : "scale-100 opacity-100",
          )}
        />
        <div
          className={cn(
            "relative aspect-3/4 overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream) transition-all duration-700 ease-in-out group-hover:scale-[1.02]",
            isTransitioning ? "scale-90" : "scale-100",
          )}
        >
          <Image
            src={currentImage}
            alt={t("productImageAlt")}
            fill
            priority
            sizes="(max-width: 1024px) 0px, 40vw"
            className={cn(
              "object-cover transition-all duration-700 ease-in-out",
              isTransitioning
                ? "opacity-0 scale-110"
                : "opacity-100 scale-100",
            )}
          />
        </div>
      </div>
    </div>
  );
}
