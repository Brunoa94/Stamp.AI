/**
 * HomeHeroSection
 *
 * Hero section with product squares scattered around centered content,
 * decorative circle animation, and clean layout.
 */

import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroProductGrid } from "../components/HeroSection/HeroProductGrid";
import { HeroScrollCue } from "../components/HeroSection/HeroScrollCue";
import { HeroDecorativeCircle } from "../components/HeroSection/HeroDecorativeCircle";

export function HomeHeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-(--color-stamp-off-white) px-6 pb-12 pt-30 lg:px-12 xl:px-24">
      <HeroDecorativeCircle />

      {/* Product squares scattered around the section */}
      <HeroProductGrid />

      <SectionReveal
        className="relative z-10 flex flex-1 items-center justify-center"
        fadeOnScroll
      >
        <div className="mx-auto max-w-3xl text-center">
          <HeroContent />
        </div>
      </SectionReveal>

      <HeroScrollCue />
    </section>
  );
}
