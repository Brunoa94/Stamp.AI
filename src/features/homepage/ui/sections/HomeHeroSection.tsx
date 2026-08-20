"use client";

/**
 * HomeHeroSection
 *
 * Hero section with title and CTA prominently displayed at the top,
 * photo-to-print transform showcases on either side,
 * and product images that bubble up from the bottom driven by scroll/wheel.
 */

import { useEffect, useState } from "react";
import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroBubblingProducts } from "../components/HeroSection/HeroBubblingProducts";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";
import { HeroTransformShowcase } from "../components/HeroSection/HeroTransformShowcase";
import { HeroPromoBanner } from "../components/HeroSection/HeroPromoBanner";
import { IMAGE_PAIRS } from "../../lib/constants/transformShowcase";

export function HomeHeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGE_PAIRS.length);
    }, 3000);

    return () => clearTimeout(intervalId);
  }, [currentIndex]);

  return (
    <section className="relative h-screen overflow-hidden bg-(--color-stamp-off-white)">
      {/* Title and CTA with transform showcases on sides */}
      <div className="relative z-20 px-6 pt-20 sm:pt-24 pb-8 lg:px-12 xl:px-24">
        <div className="mx-auto">
          <div className="flex items-end justify-center">
            {/* Left showcase - hidden below 1200px */}
            <div className="hidden min-[1200px]:block shrink-0 mb-0">
              <SectionReveal delayMs={200}>
                <HeroTransformShowcase
                  position="left"
                  currentIndex={currentIndex}
                />
              </SectionReveal>
            </div>

            {/* Center content */}
            <SectionReveal className="max-w-5xl text-center w-full">
              <HeroContent />
            </SectionReveal>

            {/* Right showcase - hidden below 1200px */}
            <div className="hidden min-[1200px]:block shrink-0 mb-0">
              <SectionReveal delayMs={400}>
                <HeroTransformShowcase
                  position="right"
                  currentIndex={currentIndex}
                />
              </SectionReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional banner */}
      <HeroPromoBanner />

      {/* Bubbling products */}
      {/* <HeroBubblingProducts /> */}
    </section>
  );
}
