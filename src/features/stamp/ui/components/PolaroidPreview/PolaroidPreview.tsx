"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

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

const sizeClasses = {
  sm: {
    container: "max-w-xs p-4",
    image: "mb-4",
    badge: "top-6 left-6 px-2 py-0.5 text-[7px]",
    spinner: "w-6 h-6",
  },
  md: {
    container: "max-w-md p-6",
    image: "mb-6",
    badge: "top-10 left-10 px-3 py-1 text-[8px]",
    spinner: "w-8 h-8",
  },
  lg: {
    container: "max-w-lg p-8",
    image: "mb-8",
    badge: "top-12 left-12 px-4 py-1.5 text-[9px]",
    spinner: "w-10 h-10",
  },
};

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
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const classes = sizeClasses[size];

  useEffect(() => {
    setIsLoading(true);
  }, [imageUrl]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <button
        type="button"
        onClick={openFullscreen}
        className={`w-full bg-white ${classes.container} shadow-xl relative rotate-1 group hover:rotate-0 transition-all duration-500 cursor-zoom-in ${className ?? ""}`}
        aria-label={fullscreenLabel}
      >
        <div
          className={`aspect-square bg-(--color-stamp-cream) flex items-center justify-center overflow-hidden ${classes.image} relative`}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-(--color-stamp-cream) z-10">
              <Loader2
                className={`${classes.spinner} animate-spin text-(--color-stamp-taupe)/40`}
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
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <div className={`absolute ${classes.badge}`}>
          <Span
            variant="badge"
            className="bg-white/80 backdrop-blur-sm border border-(--color-stamp-divider)"
          >
            {badgeText}
          </Span>
        </div>
      </button>

      {isMounted && isFullscreen && (
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
