/**
 * HomeHeroSection
 *
 * Luxury hero with animated blur blobs, gradient logo text,
 * animated product images, and scroll-based parallax animations.
 */

"use client";

import { useRef } from "react";
import { useImageCarousel } from "@/hooks/useImageCarousel";
import { useHeroParallax } from "@/hooks/useHeroParallax";
import {
  HOME_HERO_IMAGES,
  HOME_HERO_PARALLAX_CONFIG,
} from "../../lib/constants/homepageContent";
import { SectionReveal } from "../components/SectionReveal";
import { HeroBlobs } from "../components/HeroSection/HeroBlobs";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroImage } from "../components/HeroSection/HeroImage";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";

export function HomeHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { currentImage, isTransitioning } = useImageCarousel({
    images: HOME_HERO_IMAGES,
    interval: 2500,
    transitionDuration: 500,
  });

  const { textTransform, imageTranslateY, blobTranslates, fadeOpacity } =
    useHeroParallax(sectionRef, HOME_HERO_PARALLAX_CONFIG);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-(--color-stamp-off-white) px-6 pb-12 pt-30 lg:px-12 xl:px-24"
    >
      <HeroBlobs blobTranslates={blobTranslates} />

      <SectionReveal className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <HeroContent transform={textTransform} opacity={fadeOpacity} />
          <HeroImage
            currentImage={currentImage}
            isTransitioning={isTransitioning}
            translateY={imageTranslateY}
            opacity={fadeOpacity}
          />
        </div>
      </SectionReveal>

      <HeroScrollCue />
    </section>
  );
}
