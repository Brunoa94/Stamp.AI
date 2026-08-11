/**
 * HomeHeroSection
 *
 * Split hero: text column with headline, value props and CTAs next to an
 * animated garment showcase that cycles the same design through AI art
 * styles.
 */

"use client";

import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroShowcase } from "../components/HeroSection/HeroShowcase";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";

export function HomeHeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-(--color-stamp-off-white) px-6 pb-12 pt-30 lg:px-12 xl:px-24">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 items-center">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionReveal fadeOnScroll>
            <HeroContent />
          </SectionReveal>

          <SectionReveal delayMs={150} className="mx-auto w-full max-w-xl lg:max-w-none">
            <HeroShowcase />
          </SectionReveal>
        </div>
      </div>

      <HeroScrollCue />
    </section>
  );
}
