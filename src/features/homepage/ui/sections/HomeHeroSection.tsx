/**
 * HomeHeroSection
 *
 * First screen of the homepage, sized to the space left under the navbar and
 * trust strip: brand kicker, headline, tagline and upload card over the
 * diagonal photo backdrop, with the "8 steps away" headline, the animated
 * creation-flow demo and its benefit banners on the off-white side (xl+ only —
 * stacked screens keep just the copy so it fits). Below it, a ribbon of
 * product photos (shown from the first render, no scroll reveal) and the
 * promo banner.
 */

import { SectionReveal } from "../components/SectionReveal";
import { HeroBackdrop } from "../components/HeroSection/HeroBackdrop";
import { HeroContent } from "../components/HeroSection/HeroContent";
import { HeroPromoBanner } from "../components/HeroSection/HeroPromoBanner";
import { FlowPreview } from "../components/FlowPreview/FlowPreview";
import { HeroFlowIntro } from "../components/HeroSection/HeroFlowIntro";
import { HeroFlowBenefits } from "../components/HeroSection/HeroFlowBenefits";
import { HeroPhotoRibbon } from "../components/HeroSection/HeroPhotoRibbon";

export function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden bg-(--color-stamp-off-white) pb-10">
      {/* 7.5rem = navbar + trust strip above the hero */}
      <div className="relative flex min-h-[calc(100svh-7.5rem)] items-center overflow-hidden border-b border-(--color-stamp-divider) xl:h-[calc(100svh-7.5rem)] xl:min-h-176">
        <HeroBackdrop />

        <div className="relative z-20 w-full px-6 py-16 sm:py-20 lg:px-12 xl:py-10">
          <div className="mx-auto flex max-w-screen-2xl items-center justify-center gap-12 xl:justify-between">
            <SectionReveal className="w-full max-w-2xl xl:min-w-0 xl:max-w-xl xl:flex-1 2xl:max-w-2xl">
              <HeroContent />
            </SectionReveal>

            <SectionReveal
              delayMs={300}
              className="hidden xl:block xl:w-150 xl:shrink-0 2xl:w-160"
            >
              <div className="flex flex-col gap-5 2xl:gap-6 xl:ml-8">
                <HeroFlowIntro />
                <FlowPreview />
                <HeroFlowBenefits />
              </div>
            </SectionReveal>
          </div>
        </div>
      </div>

      {/* Real work drifting by: lifestyle shots and photo → product pairs */}
      <div className="mt-10">
        <HeroPhotoRibbon />
      </div>

      {/* Promotional banner */}
      <HeroPromoBanner />
    </section>
  );
}
