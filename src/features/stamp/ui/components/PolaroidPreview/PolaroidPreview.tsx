"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import {
  polaroidBadgeVariants,
  polaroidContainerVariants,
  polaroidImageVariants,
  polaroidSpinnerVariants,
} from "@/features/stamp/lib/variants/polaroidPreviewVariants";

/**
 * PolaroidPreview
 *
 * A polaroid-style image preview with fullscreen modal capability.
 * Used for mockup previews in the final review section.
 *
 * Features:
 * - Polaroid-style frame with shadow and slight rotation
 * - "PREVIEW SEALED" badge
 * - Click to open fullscreen modal
 * - Loading spinner while image loads
 * - Escape key to close modal
 */

interface PropsI {
  /** Image URL to display */
  imageUrl: string;
  /** Alt text for the image */
  alt: string;
  /** Badge text (e.g., "PREVIEW SEALED") */
  badgeText: string;
  /** Aria label for fullscreen button */
  fullscreenLabel: string;
  /** Aria label for close button */
  closeLabel: string;
  /** Hint text shown in fullscreen mode */
  hintText: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional className for the container */
  className?: string;
}

function FullscreenModal({
  imageUrl,
  alt,
  isAnimating,
  onClose,
  closeLabel,
  hintText,
}: {
  imageUrl: string;
  alt: string;
  isAnimating: boolean;
  onClose: () => void;
  closeLabel: string;
  hintText: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isAnimating ? "bg-black/90" : "bg-black/0"
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className={`absolute top-6 right-6 z-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 ${
          isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        aria-label={closeLabel}
      >
        <X className="w-6 h-6" />
      </Button>

      <div
        className={`relative w-[90vw] h-[90vh] max-w-5xl transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-12 h-12 animate-spin text-white/40" />
          </div>
        )}
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={`object-contain transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
          sizes="90vw"
          priority
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <Span
        as="p"
        variant="micro"
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 transition-all duration-300 delay-150 ${
          isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {hintText}
      </Span>
    </div>,
    document.body,
  );
}

export function PolaroidPreview({
  imageUrl,
  alt,
  badgeText,
  fullscreenLabel,
  closeLabel,
  hintText,
  size = "sm",
  className,
}: PropsI) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  // Loading is derived from which URL last finished loading, so a new
  // imageUrl shows the spinner again without resetting state in an effect.
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const isLoading = loadedUrl !== imageUrl;

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        closeFullscreen();
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
  }, [isFullscreen, closeFullscreen]);

  return (
    <>
      <Button
        type="button"
        variant="unstyled"
        onClick={openFullscreen}
        className={cn(polaroidContainerVariants({ size }), className)}
        aria-label={fullscreenLabel}
      >
        <div
          className={polaroidImageVariants({ size })}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-(--color-stamp-cream) z-10">
              <Loader2
                className={polaroidSpinnerVariants({ size })}
              />
            </div>
          )}
          <Image
            src={imageUrl}
            alt={alt}
            fill
            unoptimized
            className={`object-cover transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
            sizes="320px"
            onLoad={() => setLoadedUrl(imageUrl)}
          />
        </div>
        <div className={polaroidBadgeVariants({ size })}>
          <Span
            variant="badge"
            className="bg-white/80 backdrop-blur-sm border border-(--color-stamp-divider)"
          >
            {badgeText}
          </Span>
        </div>
      </Button>

      {/* isFullscreen only turns on from a click, so document.body exists by then */}
      {isFullscreen && (
        <FullscreenModal
          imageUrl={imageUrl}
          alt={alt}
          isAnimating={isAnimating}
          onClose={closeFullscreen}
          closeLabel={closeLabel}
          hintText={hintText}
        />
      )}
    </>
  );
}
