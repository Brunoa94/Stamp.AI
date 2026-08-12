/**
 * HeroDecorativeCircle
 *
 * Large decorative circle that shrinks and fades as user scrolls down.
 * Uses useScrollProgress to track scroll position and applies
 * scale/opacity transforms based on progress.
 */

"use client";

import { useRef, useEffect, useState } from "react";

export function HeroDecorativeCircle() {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate scale: starts at 1, shrinks to 0.2 over first 600px of scroll
  const maxScroll = 600;
  const progress = Math.min(scrollY / maxScroll, 1);
  const scale = 1 - progress * 0.8;
  const opacity = 1 - progress * 0.7;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="hero-decorative-circle pointer-events-none absolute -left-48 -top-48 z-0 lg:-left-32 lg:-top-32"
      style={{
        transform: `scale(${Math.max(0.2, scale)})`,
        opacity: Math.max(0.1, opacity),
      }}
    >
      <div className="h-100 w-100 rounded-full border-2 border-(--color-stamp-gold)/20 bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) lg:h-150 lg:w-150" />
    </div>
  );
}
