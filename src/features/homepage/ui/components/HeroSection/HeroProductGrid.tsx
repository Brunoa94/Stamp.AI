/**
 * HeroProductGrid
 *
 * Product squares scattered across the entire hero section,
 * surrounding the centered content. Each square has its own
 * image carousel with staggered timing for a dynamic feel.
 * Fades out as the user scrolls down.
 */

"use client";

import { useEffect, useState } from "react";
import { HeroProductSquare } from "./HeroProductSquare";
import { HERO_PRODUCT_SETS } from "../../../lib/constants/homepageContent";

export function HeroProductGrid() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fade out over the first 400px of scroll
      const fadeProgress = Math.min(scrollY / 400, 1);
      setScrollOpacity(1 - fadeProgress * 0.9);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block"
      style={{ opacity: scrollOpacity }}
    >
      {/* Top-left square - medium */}
      <div className="absolute left-[2%] top-[15%] xl:left-[5%]">
        <HeroProductSquare
          images={HERO_PRODUCT_SETS[0]}
          productName="Premium T-Shirt"
          size="md"
          startDelay={0}
        />
      </div>

      {/* Top-right square - large */}
      <div className="absolute right-[2%] top-[10%] xl:right-[8%]">
        <HeroProductSquare
          images={HERO_PRODUCT_SETS[1]}
          productName="Classic Hoodie"
          size="lg"
          startDelay={600}
        />
      </div>

      {/* Middle-left square - small */}
      <div className="absolute bottom-[35%] left-[1%] xl:left-[3%]">
        <HeroProductSquare
          images={HERO_PRODUCT_SETS[2]}
          productName="Canvas Tote Bag"
          size="sm"
          startDelay={1200}
        />
      </div>

      {/* Bottom-left square - medium */}
      <div className="absolute bottom-[8%] left-[5%] xl:left-[12%]">
        <HeroProductSquare
          images={HERO_PRODUCT_SETS[3]}
          productName="Unisex Sweatshirt"
          size="md"
          startDelay={1800}
        />
      </div>

      {/* Bottom-right square - medium */}
      <div className="absolute bottom-[15%] right-[2%] xl:right-[5%]">
        <HeroProductSquare
          images={HERO_PRODUCT_SETS[0]}
          productName="Organic Cotton T-Shirt"
          size="md"
          startDelay={2400}
        />
      </div>

      {/* Middle-right square - small */}
      <div className="absolute bottom-[45%] right-[1%] xl:right-[3%]">
        <HeroProductSquare
          images={HERO_PRODUCT_SETS[1]}
          productName="Premium Pullover"
          size="sm"
          startDelay={3000}
        />
      </div>
    </div>
  );
}
