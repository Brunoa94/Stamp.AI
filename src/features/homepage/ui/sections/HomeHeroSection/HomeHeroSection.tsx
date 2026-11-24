/**
 * HomeHeroSection
 *
 * First screen of the homepage, in two blocks side by side (stacked below
 * xl): on the left, the cream start card (headline, tagline, photo-or-idea
 * start options) over the drifting stamp wall; on the right, a peach panel
 * with the "8 steps away" headline, the animated creation-flow demo and its
 * benefit banners (xl+ only — stacked screens keep just the start card so it
 * fits). Under the blocks, a row of product-type banners linking to the
 * catalog, then a ribbon of product photos (shown from the first render, no
 * scroll reveal) and the promo banner. The copy and the demo enter with a CSS
 * animation that starts on first paint (`.hero-enter`), not a JS scroll
 * reveal, so the headline (the LCP element) doesn't wait for hydration.
 */

import { HeroBackdrop } from "./HeroBackdrop";
import { HeroContent } from "./HeroContent";
import { HeroPromoBanner } from "./HeroPromoBanner";
import { FlowPreview } from "../../components/FlowPreview/FlowPreview";
import { HeroFlowIntro } from "./HeroFlowIntro";
import { HeroFlowBenefits } from "./HeroFlowBenefits";
import { HeroPhotoRibbon } from "./HeroPhotoRibbon";
import { HeroProductTypes } from "./HeroProductTypes";

export function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden bg-(--color-stamp-off-white) pb-10">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 pt-4 sm:px-6 lg:px-8 xl:pt-5">
        <div className="grid gap-4 xl:min-h-176 xl:grid-cols-2">
          <div className="relative isolate flex items-center justify-center overflow-hidden rounded-md px-4 py-16 sm:px-8 sm:py-20 xl:justify-start xl:px-12 xl:py-10">
            <HeroBackdrop />
            <div className="hero-enter relative w-full max-w-xl">
              <HeroContent />
            </div>
          </div>

          <div className="hero-enter hero-enter--late hidden flex-col justify-center gap-5 rounded-md bg-(--color-stamp-peach) p-8 xl:flex 2xl:gap-6 2xl:p-10">
            <HeroFlowIntro />
            <FlowPreview />
            <HeroFlowBenefits />
          </div>
        </div>

        <HeroProductTypes />
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
