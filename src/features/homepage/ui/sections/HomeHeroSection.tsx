"use client";

/**
 * HomeHeroSection
 *
 * Hero section with title and CTA prominently displayed at the top,
 * photo-to-print transform showcases on either side,
 * and product images that bubble up from the bottom driven by scroll/wheel.
 * The section itself doesn't scroll - wheel events drive the animation.
 */

import { useEffect, useState, useCallback } from "react";
import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroBubblingProducts } from "../components/HeroSection/HeroBubblingProducts";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";
import { HeroTransformShowcase } from "../components/HeroSection/HeroTransformShowcase";
import { HeroPromoBanner } from "../components/HeroSection/HeroPromoBanner";
import { IMAGE_PAIRS } from "../../lib/constants/transformShowcase";

interface HomeHeroSectionProps {
  onBubblingProgressChange?: (progress: number) => void;
}

export function HomeHeroSection({
  onBubblingProgressChange,
}: HomeHeroSectionProps) {
  const [bubblingProgress, setBubblingProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleProgressChange = useCallback(
    (progress: number) => {
      setBubblingProgress(progress);
      onBubblingProgressChange?.(progress);
    },
    [onBubblingProgressChange],
  );

  useEffect(() => {
    const intervalId = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGE_PAIRS.length);
    }, 3000);

    return () => clearTimeout(intervalId);
  }, [currentIndex]);

  return (
    <section className="relative h-screen overflow-hidden bg-(--color-stamp-off-white)">
      {/* Title and CTA with transform showcases on sides */}
      {/* pt-32 sm:pt-36 accounts for fixed header (h-24) + trust banner (~40px) */}
      <div className="relative z-20 px-6 pt-32 sm:pt-36 pb-8 lg:px-12 xl:px-24">
        <div className="mx-auto">
          <div className="flex items-end justify-center">
            {/* Left showcase - hidden below 1200px */}
            <div className="hidden 3xl:block shrink-0 mb-0">
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

      {/* Promotional banner - fades out as products bubble up */}
      <HeroPromoBanner progress={bubblingProgress} />

      {/* Bubbling products that rise based on wheel events */}
      <HeroBubblingProducts onProgressChange={handleProgressChange} />

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <HeroScrollCue />
      </div>
    </section>
  );
}
