/**
 * HomeHeroSection
 *
 * Hero section with rotating product images and clean layout.
 */

"use client";

import { useImageCarousel } from "@/hooks/useImageCarousel";
import { HOME_HERO_IMAGES } from "../../lib/constants/homepageContent";
import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroImage } from "../components/HeroSection/HeroImage";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";

export function HomeHeroSection() {
  const { currentImage, isTransitioning } = useImageCarousel({
    images: HOME_HERO_IMAGES,
    interval: 2500,
    transitionDuration: 500,
  });

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-(--color-stamp-off-white) px-6 pb-12 pt-30 lg:px-12 xl:px-24">
      <SectionReveal className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <HeroContent />
          <HeroImage
            currentImage={currentImage}
            isTransitioning={isTransitioning}
          />
        </div>
      </SectionReveal>

      <HeroScrollCue />
    </section>
  );
}
