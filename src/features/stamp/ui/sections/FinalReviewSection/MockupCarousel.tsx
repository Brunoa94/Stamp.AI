"use client";

import { useState, useCallback, useEffect, useMemo, useRef, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { MockupImageType } from "../../../lib/types/stampFlowTypes";

/**
 * MockupCarousel
 *
 * Left panel showing product mockups in a carousel with navigation.
 * Clicking opens a fullscreen animated modal.
 */

// Number of images to preload around the current index
const PRELOAD_BUFFER = 2;

interface PropsI {
  mockupImages: MockupImageType[];
  fallbackUrl?: string;
}

/**
 * Get indices of images to preload around the current index
 */
function getPreloadIndices(currentIndex: number, totalImages: number): Set<number> {
  const indices = new Set<number>();
  for (let i = -PRELOAD_BUFFER; i <= PRELOAD_BUFFER; i++) {
    let idx = currentIndex + i;
    // Wrap around for circular navigation
    if (idx < 0) idx = totalImages + idx;
    if (idx >= totalImages) idx = idx - totalImages;
    if (idx >= 0 && idx < totalImages) {
      indices.add(idx);
    }
  }
  return indices;
}

const FullscreenModal = memo(function FullscreenModal({
  images,
  isAnimating,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  loadedImages,
  onImageLoad,
  t,
}: {
  images: MockupImageType[];
  isAnimating: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  loadedImages: Set<number>;
  onImageLoad: (index: number) => void;
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

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? "bg-black/90" : "bg-black/0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("fullscreenPreview")}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className={`absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ${
          isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        aria-label={t("closeFullscreen")}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevClick}
            className={`absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ${
              isAnimating ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
            aria-label={t("previousImage")}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNextClick}
            className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ${
              isAnimating ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
            }`}
            aria-label={t("nextImage")}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image container */}
      <div
        className={`relative w-[90vw] h-[90vh] max-w-5xl transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        onClick={handleContainerClick}
      >
        {/* Loading spinner */}
        {!loadedImages.has(currentIndex) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-12 h-12 animate-spin text-white/40" />
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
                index === currentIndex && loadedImages.has(index) ? "opacity-100" : "opacity-0"
              }`}
              sizes="90vw"
              priority
              onLoad={() => onImageLoad(index)}
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
          <p className="text-white/80 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </p>
        )}
        <p className="text-white/60 text-sm">{t("pressEscToClose")}</p>
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
  const [isMounted, setIsMounted] = useState(false);

  // Track loaded indices in a ref to avoid re-renders for off-screen preloads.
  // Only track whether the *current* image is loaded as state (to show/hide spinner).
  const loadedRef = useRef<Set<number>>(new Set());
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const handleImageLoad = useCallback((index: number) => {
    loadedRef.current.add(index);
    // Only trigger a state update when the visible image finishes loading.
    if (index === currentIndexRef.current) {
      setIsCurrentLoaded(true);
    }
  }, []);

  // Handler for direct index navigation (dots)
  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsCurrentLoaded(loadedRef.current.has(index));
  }, []);

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

  const currentImage = images[currentIndex]?.src || fallbackUrl || "";

  // Only render images within the preload buffer for performance
  const preloadIndices = useMemo(
    () => getPreloadIndices(currentIndex, images.length),
    [currentIndex, images.length]
  );

  // Reset loaded state when the image set changes (e.g., real mockups replace the fallback).
  // Without this, isCurrentLoaded stays true from the previous image and the spinner
  // never shows for the first real image.
  const firstImageSrc = images[0]?.src ?? null;
  useEffect(() => {
    loadedRef.current = new Set();
    setCurrentIndex(0);
    setIsCurrentLoaded(false);
  }, [firstImageSrc]);

  // Ensure we're on client side for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? images.length - 1 : prev - 1;
      setIsCurrentLoaded(loadedRef.current.has(next));
      return next;
    });
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === images.length - 1 ? 0 : prev + 1;
      setIsCurrentLoaded(loadedRef.current.has(next));
      return next;
    });
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
        <button
          type="button"
          onClick={openFullscreen}
          className="w-full max-w-[min(36rem,52vh)] bg-white p-6 shadow-2xl relative rotate-1 group hover:rotate-0 transition-all duration-1000 cursor-zoom-in hover:shadow-3xl hover:scale-[1.02]"
          aria-label={t("viewFullscreen")}
        >
          <div className="aspect-square bg-(--color-stamp-cream) flex items-center justify-center overflow-hidden mb-6 relative">
            {/* Loading spinner */}
            {!isCurrentLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-(--color-stamp-cream) z-10">
                <Loader2 className="w-8 h-8 animate-spin text-(--color-stamp-taupe)/40" />
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
                  priority
                  onLoad={() => handleImageLoad(index)}
                />
              ) : null
            )}
          </div>
          <div className="absolute top-10 left-10">
            <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-(--color-stamp-divider) text-[8px] font-bold uppercase tracking-widest">
              {t("previewSealed")}
            </span>
          </div>
        </button>

        {/* Carousel navigation */}
        {images.length > 1 && (
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={goToPrev}
              className="p-2 rounded-full border border-(--color-stamp-divider) hover:bg-(--color-stamp-divider)/10 transition-colors"
              aria-label={t("previousImage")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Thumbnail dots - only show if reasonable number of images */}
            {images.length <= 10 ? (
              <div className="flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-(--color-stamp-black) scale-125"
                        : "bg-(--color-stamp-divider) hover:bg-(--color-stamp-black)/50"
                    }`}
                    aria-label={`${t("goToImage")} ${index + 1}`}
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm font-medium text-(--color-stamp-black) min-w-16 text-center">
                {currentIndex + 1} / {images.length}
              </span>
            )}

            <button
              type="button"
              onClick={goToNext}
              className="p-2 rounded-full border border-(--color-stamp-divider) hover:bg-(--color-stamp-divider)/10 transition-colors"
              aria-label={t("nextImage")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Image counter - only show separately when using dots */}
        {images.length > 1 && images.length <= 10 && (
          <p className="mt-3 text-sm text-(--color-stamp-muted)">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isMounted && isFullscreen && (
        <FullscreenModal
          images={images}
          isAnimating={isAnimating}
          onClose={closeFullscreen}
          onPrev={goToPrev}
          onNext={goToNext}
          currentIndex={currentIndex}
          loadedImages={loadedRef.current}
          onImageLoad={handleImageLoad}
          t={t}
        />
      )}
    </>
  );
}

export const MockupCarousel = memo(MockupCarouselComponent);
