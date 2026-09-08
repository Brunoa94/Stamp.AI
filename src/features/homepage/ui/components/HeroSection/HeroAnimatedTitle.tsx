/**
 * HeroAnimatedTitle
 *
 * Wrapper that applies blur-to-clear scale-in animation to title on load,
 * and fades out the title as the user scrolls down.
 */

"use client";

import { useEffect, useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";

interface HeroAnimatedTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroAnimatedTitle({
  children,
  className,
}: HeroAnimatedTitleProps) {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.3,
    triggerOnce: true,
  });

  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [scrollBlur, setScrollBlur] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fade out over the first 400px of scroll
      const fadeProgress = Math.min(scrollY / 400, 1);
      setScrollOpacity(1 - fadeProgress * 0.9);
      setScrollBlur(fadeProgress * 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? scrollOpacity : 0,
        filter: isVisible ? `blur(${scrollBlur}px)` : "blur(8px)",
      }}
      className={cn(
        "hero-title-animate",
        isVisible && "hero-title-animate--visible",
        className
      )}
    >
      {children}
    </div>
  );
}
