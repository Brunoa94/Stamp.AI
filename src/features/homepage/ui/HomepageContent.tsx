/**
 * HomepageContent
 *
 * Server-rendered orchestrator for the homepage. It keeps the original
 * section rhythm (trust strip, stamp-wall hero, essentials, story, promo
 * carousels, marquee, product of the month, process, guarantees, CTA, FAQ)
 * and weaves in the marketplace sections (shop by category, gift ideas).
 * Interactive sections are client components on their own. Navbar and footer
 * come from the root layout chrome.
 */

import type { ProductCardData } from "../lib/mappers/productCardMapper";
import { TRUST_SOCIAL_PROOF_ENABLED } from "@/shared/constants/trustMetrics";
import { TopTrustBanner } from "./sections/TopTrustBanner/TopTrustBanner";
import { HomeHeroSection } from "./sections/HomeHeroSection/HomeHeroSection";
import { PaymentMethodsBanner } from "./sections/PaymentMethodsBanner/PaymentMethodsBanner";
import { HomeCategoriesSection } from "./sections/HomeCategoriesSection/HomeCategoriesSection";
import { HomeProductsSection } from "./sections/HomeProductsSection/HomeProductsSection";
import { HomeStorySection } from "./sections/HomeStorySection/HomeStorySection";
import { HomePromoSection } from "./sections/HomePromoSection/HomePromoSection";
import { HomeGiftIdeasSection } from "./sections/HomeGiftIdeasSection/HomeGiftIdeasSection";
import { HomeProductMarqueeSection } from "./sections/HomeProductMarqueeSection/HomeProductMarqueeSection";
import { HomeProductOfMonthSection } from "./sections/HomeProductOfMonthSection/HomeProductOfMonthSection";
import { HomeProcessSection } from "./sections/HomeProcessSection/HomeProcessSection";
import { HomeTrustGuaranteesSection } from "./sections/HomeTrustGuaranteesSection/HomeTrustGuaranteesSection";
import { HomeCtaSection } from "./sections/HomeCtaSection/HomeCtaSection";
import { HomeReviewsSection } from "./sections/HomeReviewsSection/HomeReviewsSection";
import { HomeFaqSection } from "./sections/HomeFaqSection/HomeFaqSection";

interface PropsI {
  /** Mapped and translated on the server */
  products: ProductCardData[];
}

export function HomepageContent({ products }: PropsI) {
  return (
    <div className="overflow-x-clip">
      <TopTrustBanner />
      <HomeHeroSection />
      <PaymentMethodsBanner />
      <HomeCategoriesSection />
      <HomeProductsSection products={products} />
      <HomeStorySection blockIds={["design"]} background="chocolate" />
      <HomeGiftIdeasSection />
      <HomeProductMarqueeSection />
      <HomeProductOfMonthSection />
      <div className="hidden md:block">
        <HomePromoSection variant="memories" background="white" contentPosition="right" />
      </div>
      <HomeProcessSection />
      <div className="hidden md:block">
        <HomePromoSection variant="special-moments" background="chocolate" contentPosition="left" />
      </div>
      <HomeTrustGuaranteesSection />
      <HomeCtaSection />
      {TRUST_SOCIAL_PROOF_ENABLED && <HomeReviewsSection />}
      <HomeFaqSection />
    </div>
  );
}
