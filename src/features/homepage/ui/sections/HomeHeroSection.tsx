"use client";

/**
 * HomeHeroSection
 *
 * Hero section with title and CTA prominently displayed at the top,
 * photo-to-print transform showcases on either side,
 * and product images that bubble up from the bottom driven by scroll/wheel.
 * The section itself doesn't scroll - wheel events drive the animation.
 */

import { useState } from "react";
import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroBubblingProducts } from "../components/HeroSection/HeroBubblingProducts";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";
import { HeroTransformShowcase } from "../components/HeroSection/HeroTransformShowcase";
import { HeroPromoBanner } from "../components/HeroSection/HeroPromoBanner";

export function HomeHeroSection() {
  const [bubblingProgress, setBubblingProgress] = useState(0);

  return (
    <section className="relative h-screen overflow-hidden bg-(--color-stamp-off-white)">
      {/* Title and CTA with transform showcases on sides */}
      <div className="relative z-20 px-6 pt-20 sm:pt-24 pb-8 lg:px-12 xl:px-24">
        <div className="mx-auto">
          <div className="flex items-end">
            {/* Left showcase - hidden on mobile */}
            <div className="hidden lg:block shrink-0 mb-0 ">
              <SectionReveal delayMs={200}>
                <HeroTransformShowcase position="left" startIndex={0} />
              </SectionReveal>
            </div>

            {/* Center content */}
            <SectionReveal className="max-w-5xl text-center w-full">
              <HeroContent />
            </SectionReveal>

            {/* Right showcase - hidden on mobile */}
            <div className="hidden lg:block shrink-0 mb-0 ">
              <SectionReveal delayMs={400}>
                <HeroTransformShowcase position="right" startIndex={2} />
              </SectionReveal>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional banner - fades out as products bubble up */}
      <HeroPromoBanner progress={bubblingProgress} />

      {/* Bubbling products that rise based on wheel events */}
      <HeroBubblingProducts onProgressChange={setBubblingProgress} />

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <HeroScrollCue />
      </div>
    </section>
  );
}
