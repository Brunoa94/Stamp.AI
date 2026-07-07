"use client";

import { HeroImage } from "./HeroImage";
import { HeroContent } from "./HeroContent";

/**
 * HeroSection
 *
 * Entry point for the Stamp luxury flow.
 * Displays the brand introduction and primary CTA.
 */

interface PropsI {
  onBegin: () => void;
}

export function HeroSection({ onBegin }: PropsI) {
  return (
    <section
      id="hero"
      className="h-full grid grid-cols-1 lg:grid-cols-2 bg-white"
    >
      <HeroImage />
      <HeroContent onBegin={onBegin} />
    </section>
  );
}
