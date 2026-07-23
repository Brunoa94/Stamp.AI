"use client";

import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import {
  getParallaxTransform,
  getFadeOpacity,
} from "../../lib/helpers/scrollEffects";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before reveal animation starts (ms) */
  delayMs?: number;
  /** Enable parallax scroll effect */
  parallax?: boolean;
  /** Parallax movement intensity (default: 0.3) */
  parallaxFactor?: number;
  /** Enable fade in/out at viewport edges */
  fadeOnScroll?: boolean;
}

/**
 * SectionReveal
 *
 * Wrapper component that reveals children with animation when entering viewport.
 * Optionally adds parallax and fade effects based on scroll position.
 */
export function SectionReveal({
  children,
  className,
  delayMs = 0,
  parallax = false,
  parallaxFactor = 0.3,
  fadeOnScroll = false,
}: SectionRevealProps) {
  const hasScrollEffects = parallax || fadeOnScroll;

  // Use intersection observer for initial reveal
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
    triggerOnce: true,
  });

  // Use scroll progress for parallax/fade effects
  const { progress } = useScrollProgress(ref, hasScrollEffects && isVisible);

  // Calculate scroll-based styles
  const scrollTransform = parallax ? getParallaxTransform(progress, parallaxFactor) : undefined;
  const scrollOpacity = fadeOnScroll ? getFadeOpacity(progress) : undefined;

  // Render with scroll effects (CSS variants + dynamic inline styles for parallax/fade)
  if (hasScrollEffects) {
    // When visible, use scroll-based opacity/transform; otherwise use initial hidden values
    const visibleOpacity = scrollOpacity !== undefined ? scrollOpacity : 1;
    const visibleTransform = scrollTransform ?? "translateY(0) scale(1)";

    return (
      <div
        ref={ref}
        style={{
          transitionDelay: `${delayMs}ms`,
          opacity: isVisible ? visibleOpacity : 0,
          transform: isVisible ? visibleTransform : "translateY(28px) scale(0.985)",
        }}
        className={cn(
          "section-reveal-scroll",
          isVisible ? "section-reveal-scroll--visible" : "section-reveal-scroll--hidden",
          className
        )}
      >
        {children}
      </div>
    );
  }

  // Render with CSS class-based reveal (no scroll effects)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn("scroll-reveal", isVisible && "scroll-reveal--visible", className)}
    >
      {children}
    </div>
  );
}
