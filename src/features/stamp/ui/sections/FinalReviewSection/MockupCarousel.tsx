"use client";

import { useState, useCallback, useEffect, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { MockupImageType } from "../../../lib/types/stampFlowTypes";
import { getPreloadIndices } from "../../../lib/utils/carouselUtils";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import {
  polaroidBadgeVariants,
  polaroidContainerVariants,
  polaroidImageVariants,
  polaroidSpinnerVariants,
} from "../../../lib/variants/polaroidPreviewVariants";
import {
  stampLightboxButtonVariants,
  stampRoundIconButtonVariants,
} from "../../../lib/variants/stampStudioVariants";

/**
 * MockupCarousel
 *
 * Left panel showing product mockups in a carousel with navigation.
 * Clicking opens a fullscreen animated modal.
 */

interface PropsI {
  mockupImages: MockupImageType[];
  fallbackUrl?: string;
}

const FullscreenModal = memo(function FullscreenModal({
  images,
  isAnimating,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  isCurrentLoaded,
  onImageLoad,
  t,
}: {
  images: MockupImageType[];
  isAnimating: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  isCurrentLoaded: boolean;
  onImageLoad: (src: string) => void;
  t: (key: string) => string;
}) {
  // Only render images within the preload buffer
  const preloadIndices = useMemo(
    () => getPreloadIndices(currentIndex, images.length),
    [currentIndex, images.length]
  );

  // Memoized handlers to prevent inline function recreation
  const handlePrevClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPrev();
    },
    [onPrev]
  );

  const handleNextClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNext();
    },
    [onNext]
  );

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? "bg-(--color-stamp-chocolate)/95" : "bg-(--color-stamp-chocolate)/0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t("fullscreenPreview")}
    >
      {/* Click-outside target behind the image; keyboard users have the close
          button and Escape, so it stays out of the tab order and the a11y tree */}
      <Button
        type="button"
        variant="unstyled"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      {/* Close button */}
      <Button
        type="button"
        variant="unstyled"
        onClick={onClose}
        className={cn(
          stampLightboxButtonVariants(),
          "absolute top-6 right-6 z-10",
          isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        )}
        aria-label={t("closeFullscreen")}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            type="button"
            variant="unstyled"
            onClick={handlePrevClick}
            className={cn(
              stampLightboxButtonVariants(),
              "absolute left-6 top-1/2 -translate-y-1/2 z-10",
              isAnimating ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
            )}
            aria-label={t("previousImage")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            type="button"
            variant="unstyled"
            onClick={handleNextClick}
            className={cn(
              stampLightboxButtonVariants(),
              "absolute right-6 top-1/2 -translate-y-1/2 z-10",
              isAnimating ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4",
            )}
            aria-label={t("nextImage")}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Image container */}
      <div
        className={`relative w-[90vw] h-[90vh] max-w-5xl transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        {/* Loading spinner */}
        {!isCurrentLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-12 h-12 animate-spin text-(--color-stamp-taupe-light)" />
          </div>
        )}
        {/* Only render images within buffer range for performance */}
        {images.map((img, index) =>
          preloadIndices.has(index) ? (
            <Image
              key={img.src}
              src={img.src}
              alt={t("mockupAlt")}
              fill
              unoptimized
              className={`object-contain transition-opacity duration-200 ${
                index === currentIndex && isCurrentLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="90vw"
              priority
              onLoad={() => onImageLoad(img.src)}
            />
          ) : null
        )}
      </div>

      {/* Image counter and hint */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-300 delay-150 ${
          isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {images.length > 1 && (
          <Paragraph unstyled className="text-(--color-stamp-off-white) text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </Paragraph>
        )}
        <Paragraph unstyled className="text-(--color-stamp-taupe-light) text-sm">{t("pressEscToClose")}</Paragraph>
      </div>
    </div>,
    document.body
  );
});

function MockupCarouselComponent({ mockupImages, fallbackUrl }: PropsI) {
  const t = useTranslations("stamp.finalReview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoize images array to prevent recreating on every render
  const images = useMemo(
    () =>
      mockupImages.length > 0
        ? mockupImages
        : fallbackUrl
          ? [{ src: fallbackUrl, variant_ids: [], position: "front", is_default: true }]
          : [],
    [mockupImages, fallbackUrl]
  );

  // Loaded images are tracked by src, so a new image set (e.g. real mockups
  // replacing the fallback) starts unloaded without an explicit reset.
  const [loadedSrcs, setLoadedSrcs] = useState<ReadonlySet<string>>(() => new Set());

  const handleImageLoad = useCallback((src: string) => {
    setLoadedSrcs((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
  }, []);

  // Go back to the first image when the image set changes.
  const firstImageSrc = images[0]?.src ?? null;
  const [prevFirstImageSrc, setPrevFirstImageSrc] = useState(firstImageSrc);
  if (firstImageSrc !== prevFirstImageSrc) {
    setPrevFirstImageSrc(firstImageSrc);
    setCurrentIndex(0);
  }

  const currentImage = images[currentIndex]?.src || fallbackUrl || "";
  const isCurrentLoaded = loadedSrcs.has(images[currentIndex]?.src ?? "");

  // Only render images within the preload buffer for performance
  const preloadIndices = useMemo(
    () => getPreloadIndices(currentIndex, images.length),
    [currentIndex, images.length]
  );

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsFullscreen(false);
    }, 300);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        closeFullscreen();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        goToPrev();
      } else if (e.key === "ArrowRight" && images.length > 1) {
        goToNext();
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, closeFullscreen, goToPrev, goToNext, images.length]);

  if (!currentImage) {
    return null;
  }

  return (
    <>
      <div className="hidden md:flex p-6 md:p-8 md:pt-16 lg:p-12 lg:pt-16 flex-col items-center justify-center bg-(--color-stamp-divider)/5 border-r border-(--color-stamp-divider)">
        {/* Main image */}
        <Button
          type="button"
          variant="unstyled"
          onClick={openFullscreen}
          className={cn(polaroidContainerVariants({ size: "md" }), "max-w-[min(36rem,52vh)]")}
          aria-label={t("viewFullscreen")}
        >
          <div className={polaroidImageVariants()}>
            {/* Loading spinner */}
            {!isCurrentLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-(--color-stamp-cream) z-10">
                <Loader2 className={polaroidSpinnerVariants({ size: "md" })} />
              </div>
            )}
            {/* Only render images within buffer range for performance */}
            {images.map((img, index) =>
              preloadIndices.has(index) ? (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={t("mockupAlt")}
                  fill
                  unoptimized
                  className={`object-cover transition-opacity duration-200 ${
                    index === currentIndex && isCurrentLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 576px, 672px"
                  onLoad={() => handleImageLoad(img.src)}
                />
              ) : null
            )}
          </div>
          <div className={polaroidBadgeVariants({ size: "md" })}>
            <Span
              variant="badge"
              className="rounded-md border border-(--color-stamp-divider) bg-(--color-stamp-white)/90 px-2 py-1 text-(--color-stamp-chocolate)"
            >
              {t("previewSealed")}
            </Span>
          </div>
        </Button>

        {/* Carousel navigation */}
        {images.length > 1 && (
          <div className="mt-6 flex items-center gap-4">
            <Button
              type="button"
              variant="unstyled"
              onClick={goToPrev}
              className={stampRoundIconButtonVariants()}
              aria-label={t("previousImage")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Thumbnail dots - only show if reasonable number of images */}
            {images.length <= 10 ? (
              <div className="flex gap-2">
                {images.map((_, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="unstyled"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
                      index === currentIndex
                        ? "bg-(--color-stamp-chocolate) scale-125"
                        : "bg-(--color-stamp-chocolate)/20 hover:bg-(--color-stamp-chocolate)/50",
                    )}
                    aria-label={`${t("goToImage")} ${index + 1}`}
                  />
                ))}
              </div>
            ) : (
              <Span unstyled className="text-sm font-medium text-(--color-stamp-chocolate) min-w-16 text-center">
                {currentIndex + 1} / {images.length}
              </Span>
            )}

            <Button
              type="button"
              variant="unstyled"
              onClick={goToNext}
              className={stampRoundIconButtonVariants()}
              aria-label={t("nextImage")}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Image counter - only show separately when using dots */}
        {images.length > 1 && images.length <= 10 && (
          <Paragraph unstyled className="mt-3 text-sm text-(--color-stamp-taupe)">
            {currentIndex + 1} / {images.length}
          </Paragraph>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <FullscreenModal
          images={images}
          isAnimating={isAnimating}
          onClose={closeFullscreen}
          onPrev={goToPrev}
          onNext={goToNext}
          currentIndex={currentIndex}
          isCurrentLoaded={isCurrentLoaded}
          onImageLoad={handleImageLoad}
          t={t}
        />
      )}
    </>
  );
}

export const MockupCarousel = memo(MockupCarouselComponent);
