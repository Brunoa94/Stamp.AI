"use client";

/**
 * HomepageContent
 *
 * Client-side orchestrator for the luxury homepage: renders the server-mapped
 * products and composes all sections. Navbar and footer come from the root
 * layout chrome — not re-added here.
 */

import type { ProductCardData } from "../lib/mappers/productCardMapper";
import { TopTrustBanner } from "./sections/TopTrustBanner/TopTrustBanner";
import { PaymentMethodsBanner } from "./sections/PaymentMethodsBanner/PaymentMethodsBanner";
import { HomeHeroSection } from "./sections/HomeHeroSection/HomeHeroSection";
import { HomeProductsSection } from "./sections/HomeProductsSection/HomeProductsSection";
import { HomeProcessSection } from "./sections/HomeProcessSection/HomeProcessSection";
import { HomeTrustGuaranteesSection } from "./sections/HomeTrustGuaranteesSection/HomeTrustGuaranteesSection";
import { HomeCtaSection } from "./sections/HomeCtaSection/HomeCtaSection";
import { HomeReviewsSection } from "./sections/HomeReviewsSection/HomeReviewsSection";
import { TRUST_SOCIAL_PROOF_ENABLED } from "@/shared/constants/trustMetrics";
import { HomeFaqSection } from "./sections/HomeFaqSection/HomeFaqSection";
import { HomeStorySection } from "./sections/HomeStorySection/HomeStorySection";
import { HomeProductOfMonthSection } from "./sections/HomeProductOfMonthSection/HomeProductOfMonthSection";
import { HomePromoSection } from "./sections/HomePromoSection/HomePromoSection";
import { HomeProductMarqueeSection } from "./sections/HomeProductMarqueeSection/HomeProductMarqueeSection";

interface HomepageContentPropsI {
  /** Mapped and translated on the server */
  products: ProductCardData[];
}

export function HomepageContent({
  products,
}: HomepageContentPropsI) {
  return (
    <div className="overflow-x-clip">
      <TopTrustBanner />
      <HomeHeroSection />
      <PaymentMethodsBanner />
      <HomeProductsSection products={products} />
      <HomeStorySection blockIds={["design"]} background="chocolate" />
      <HomePromoSection
        variant="brand-logo"
        background="cream"
        contentPosition="right"
      />
      <HomeProductMarqueeSection />
      <HomeProductOfMonthSection />
      <div className="hidden md:block">
        <HomePromoSection
          variant="memories"
          background="white"
          contentPosition="right"
        />
      </div>
      {/* <HomeStorySection blockIds={["quality"]} background="white" /> */}

      <HomeProcessSection />
      <div className="hidden md:block">
        <HomePromoSection
          variant="special-moments"
          background="chocolate"
          contentPosition="left"
        />
      </div>
      <HomeTrustGuaranteesSection />
      <HomeCtaSection />
      {TRUST_SOCIAL_PROOF_ENABLED && <HomeReviewsSection />}
      <HomeFaqSection />
    </div>
  );
}
