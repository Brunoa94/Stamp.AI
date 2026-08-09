// THIS FILE SHOULD BE ENTIRELY REFACTORED TO BETTER FOLLOW THE PATTERNS OF THE PROJECT. THERE IS CODE REPLICATED WITH SAME FUNCTIONALITIES IN THIS FILE THAT IS SHARED GLOBALLY

"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, Loader2 } from "lucide-react";

/**
 * MockupPreview
 *
 * Left panel showing the final product mockup with sealed badge.
 * Clicking opens a fullscreen animated modal.
 */

interface PropsI {
  mockupUrl: string;
}

function FullscreenModal({
  mockupUrl,
  isAnimating,
  onClose,
  t,
}: {
  mockupUrl: string;
  isAnimating: boolean;
  onClose: () => void;
  t: (key: string) => string;
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

      {/* Image container */}
      <div
        className={`relative w-[90vw] h-[90vh] max-w-5xl transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-12 h-12 animate-spin text-white/40" />
          </div>
        )}
        <Image
          src={mockupUrl}
          alt={t("mockupAlt")}
          fill
          className={`object-contain transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
          sizes="90vw"
          priority
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Hint text */}
      <p
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm transition-all duration-300 delay-150 ${
          isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {t("pressEscToClose")}
      </p>
    </div>,
    document.body,
  );
}

export function MockupPreview({ mockupUrl }: PropsI) {
  const t = useTranslations("stamp.finalReview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when mockup URL changes
  useEffect(() => {
    setIsLoading(true);
  }, [mockupUrl]);

  // Ensure we're on client side for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
    // Trigger animation after mount
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    });
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsAnimating(false);
    // Wait for animation to complete before unmounting
    setTimeout(() => {
      setIsFullscreen(false);
    }, 300);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, closeFullscreen]);

  return (
    <>
      <div className="p-6 md:p-12 lg:p-24 flex items-center justify-center bg-(--color-stamp-divider)/5 border-r border-(--color-stamp-divider)">
        <button
          type="button"
          onClick={openFullscreen}
          className="w-full max-w-md bg-white p-6 shadow-2xl relative rotate-1 group hover:rotate-0 transition-all duration-1000 cursor-zoom-in hover:shadow-3xl hover:scale-[1.02]"
          aria-label={t("viewFullscreen")}
        >
          <div className="aspect-square bg-(--color-stamp-cream) flex items-center justify-center overflow-hidden mb-6 relative">
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-(--color-stamp-cream) z-10">
                <Loader2 className="w-8 h-8 animate-spin text-(--color-stamp-taupe)/40" />
              </div>
            )}
            <Image
              src={mockupUrl}
              alt={t("mockupAlt")}
              fill
              className={`object-cover transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
              sizes="(max-width: 768px) 100vw, 448px"
              onLoad={() => setIsLoading(false)}
            />
          </div>
          <div className="absolute top-10 left-10">
            <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-(--color-stamp-divider) text-[8px] font-bold uppercase tracking-widest">
              {t("previewSealed")}
            </span>
          </div>
        </button>
      </div>

      {/* Fullscreen Modal - rendered via portal to body */}
      {isMounted && isFullscreen && (
        <FullscreenModal
          mockupUrl={mockupUrl}
          isAnimating={isAnimating}
          onClose={closeFullscreen}
          t={t}
        />
      )}
    </>
  );
}
