/**
 * HomepageContent
 *
 * Server-side orchestrator for the luxury homepage: maps the server-fetched
 * products and composes all sections. Navbar and footer come from the root
 * layout chrome — not re-added here.
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { mapProductsToCards } from "../lib/mappers/productCardMapper";
import { TopTrustBanner } from "./components/TopTrustBanner";
import { PaymentMethodsBanner } from "./components/PaymentMethodsBanner";
import { HomeHeroSection } from "./sections/HomeHeroSection";
import { HomeProductsSection } from "./sections/HomeProductsSection";
import { HomeProcessSection } from "./sections/HomeProcessSection";
import { HomeTrustGuaranteesSection } from "./sections/HomeTrustGuaranteesSection";
import { HomeCtaSection } from "./sections/HomeCtaSection";
import { HomeReviewsSection } from "./sections/HomeReviewsSection";
import { HomeFaqSection } from "./sections/HomeFaqSection";
import { HomeStorySection } from "./sections/HomeStorySection";
import { HomeProductOfMonthSection } from "./sections/HomeProductOfMonthSection";
import { HomePromoSection } from "./sections/HomePromoSection";

interface HomepageContentPropsI {
  productsWithPricing: ProductWithPricing[];
}

export function HomepageContent({
  productsWithPricing,
}: HomepageContentPropsI) {
  const products = mapProductsToCards(productsWithPricing);

  return (
    <div>
      <TopTrustBanner />
      <HomeHeroSection />
      <PaymentMethodsBanner />
      <HomeProductsSection products={products} />
      <HomePromoSection variant="brand-logo" background="cream" contentPosition="left" />
      <HomeStorySection blockIds={["design"]} />
      <HomeProductOfMonthSection />
      <HomePromoSection variant="memories" background="white" contentPosition="right" />
      <HomeStorySection blockIds={["quality"]} background="white" />
      <HomeProcessSection />
      <HomePromoSection variant="special-moments" background="cream" contentPosition="left" />
      <HomeTrustGuaranteesSection />
      <HomeCtaSection />
      <HomeReviewsSection />
      <HomeFaqSection />
    </div>
  );
}
