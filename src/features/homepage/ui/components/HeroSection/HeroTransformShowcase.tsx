"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { IMAGE_PAIRS } from "@/features/homepage/lib/constants/transformShowcase";

interface PropsI {
  /** Left shows photos, right shows printed products */
  position: "left" | "right";
  /** Controlled index from parent for synchronized animations */
  currentIndex: number;
  className?: string;
}

export function HeroTransformShowcase({
  position,
  currentIndex,
  className,
}: PropsI) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get image from pair based on position (left = photo, right = printed)
  const currentPair = IMAGE_PAIRS[currentIndex % IMAGE_PAIRS.length];
  const nextPair = IMAGE_PAIRS[(currentIndex + 1) % IMAGE_PAIRS.length];
  const currentImage =
    position === "left" ? currentPair.photo : currentPair.printed;
  const nextImage = position === "left" ? nextPair.photo : nextPair.printed;
  const label = position === "left" ? "Photo" : "Printed";
  const labelStyle =
    position === "left"
      ? "bg-white/90 text-(--color-stamp-chocolate)"
      : "bg-(--color-stamp-gold) text-white";

  useEffect(() => {
    const cycleTimeout = setTimeout(() => {
      setIsTransitioning(true);

      // After transition, update index
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % IMAGE_PAIRS.length);
        setIsTransitioning(false);
      }, 700);
    }, DISPLAY_MS);

    return () => {
      clearTimeout(cycleTimeout);
    };
  }, [currentIndex]);
  // Icon and badge config based on position
  const TopIcon = position === "left" ? Camera : Sparkles;
  const topBadgeText = position === "left" ? "Upload" : "Made to Order";
  const BottomIcon = position === "left" ? Sparkles : Truck;
  const bottomBadgeText = position === "left" ? "Your Design" : "Ready to Ship";

  return (
    <div
      className={cn(
        "relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96",
        className,
      )}
    >
      {/* Decorative ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border-2 border-(--color-stamp-gold)/30",
          "animate-pulse",
        )}
      />

      {/* All images stacked with crossfade */}
      {IMAGE_PAIRS.map((pair, index) => {
        const image = position === "left" ? pair.photo : pair.printed;
        const isActive = index === currentIndex;

        return (
          <div
            key={index}
            className={cn(
              "absolute inset-x-2 top-8 bottom-2 rounded-2xl overflow-hidden shadow-lg",
              "transition-opacity duration-700 ease-in-out",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        );
      })}

      {/* Top left badge - image badge for left, icon+text for right */}
      {position === "left" ? (
        <div
          className={cn(
            "absolute -top-6 -left-6 sm:-top-8 sm:-left-8 md:-top-10 md:-left-10",
            "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
            "transition-all duration-700 ease-in-out",
            isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100",
          )}
          style={{
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <Image
            src="/badges/upload-badge-2.png"
            alt="Upload"
            fill
            sizes="192px"
            className="object-contain drop-shadow-lg"
          />
        </div>
      ) : null}
      {/* Top left badge with icon */}
      <div
        className={cn(
          "absolute -top-2 -left-2 sm:-top-3 sm:-left-3",
          "flex items-center gap-1.5 sm:gap-2",
          "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2",
          "rounded-full shadow-lg",
          "bg-white border border-(--color-stamp-cream)",
          "transition-all duration-700 ease-in-out",
        )}
        style={{
          animation: "float 3s ease-in-out infinite",
        }}
      >
        <TopIcon className="w-3 h-3 sm:w-4 sm:h-4 text-(--color-stamp-gold)" />
        <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-(--color-stamp-chocolate) whitespace-nowrap">
          {topBadgeText}
        </span>
      </div>

      {/* Bottom right badge — only shown for the right (printed) showcase */}
      {position === "right" && (
        <div
          className={cn(
            "absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 md:-bottom-10 md:-right-10",
            "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36",
            "transition-all duration-700 ease-in-out",
            isTransitioning ? "scale-90 opacity-70" : "scale-100 opacity-100",
          )}
          style={{
            animation: "bounce-subtle 2s ease-in-out infinite",
          }}
        >
          <Image
            src="/badges/ready-to-ship-badge-2.png"
            alt="Ready to Ship"
            fill
            sizes="144px"
            className="object-contain drop-shadow-lg"
          />
        </div>
      )}

      {/* Progress indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
        {IMAGE_PAIRS.map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              index === currentIndex % IMAGE_PAIRS.length
                ? "bg-(--color-stamp-gold)"
                : "bg-(--color-stamp-chocolate)/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}
