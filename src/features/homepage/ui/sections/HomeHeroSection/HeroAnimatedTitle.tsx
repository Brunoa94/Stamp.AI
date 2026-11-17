/**
 * HeroAnimatedTitle
 *
 * Wrapper that scales the title in on load and fades it out as the user
 * scrolls down. The entrance is a CSS animation that starts on first paint
 * (`.hero-title-animate`), so the headline, the page's LCP element, doesn't
 * wait for hydration to appear.
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroAnimatedTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroAnimatedTitle({
  children,
  className,
}: HeroAnimatedTitleProps) {
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
      style={{
        opacity: scrollOpacity,
        filter: `blur(${scrollBlur}px)`,
      }}
      className={cn("hero-title-animate", className)}
    >
      {children}
    </div>
  );
}
