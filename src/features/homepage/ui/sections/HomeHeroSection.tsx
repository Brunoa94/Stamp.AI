/**
 * HomeHeroSection
 *
 * First screen of the homepage: brand title, tagline and CTAs next to the
 * animated creation-flow demo (stacked below on narrower screens), then a
 * ribbon of product photos and the trust row.
 */

import { SectionReveal } from "../components/SectionReveal";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroPromoBanner } from "../components/HeroSection/HeroPromoBanner";
import { FlowPreview } from "../components/FlowPreview/FlowPreview";
import { HeroPhotoRibbon } from "../components/HeroSection/HeroPhotoRibbon";

export function HomeHeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-(--color-stamp-off-white) pb-10">
      {/* pt-32 sm:pt-36 accounts for fixed header (h-24) + trust banner (~40px) */}
      <div className="relative z-20 px-6 pt-32 sm:pt-20 pb-8 lg:px-12">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-10 xl:flex-row xl:justify-between xl:gap-12">
          <SectionReveal className="w-full max-w-5xl text-center xl:min-w-0 xl:flex-1 xl:text-left">
            <HeroContent />
          </SectionReveal>

          <SectionReveal
            delayMs={300}
            className="w-full xl:w-160 xl:shrink-0"
          >
            <FlowPreview />
          </SectionReveal>
        </div>
      </div>

      {/* Real work drifting by: lifestyle shots and photo → product pairs */}
      <SectionReveal delayMs={500} className="mt-4 xl:mt-8">
        <HeroPhotoRibbon />
      </SectionReveal>

      {/* Promotional banner */}
      <HeroPromoBanner />
    </section>
  );
}
