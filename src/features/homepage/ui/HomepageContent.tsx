/**
 * HomepageContent
 *
 * Server-side orchestrator for the luxury homepage: maps the server-fetched
 * products and composes all sections. Navbar and footer come from the root
 * layout chrome — not re-added here.
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { mapProductsToCards } from "../lib/mappers/productCardMapper";
import { HomeHeroSection } from "./sections/HomeHeroSection";
import { HomeProductsSection } from "./sections/HomeProductsSection";
import { HomeProcessSection } from "./sections/HomeProcessSection";
import { HomeTrustGuaranteesSection } from "./sections/HomeTrustGuaranteesSection";
import { HomeManifestoSection } from "./sections/HomeManifestoSection";
import { HomeCtaSection } from "./sections/HomeCtaSection";
import { HomeReviewsSection } from "./sections/HomeReviewsSection";
import { HomeFaqSection } from "./sections/HomeFaqSection";
import { HomeStorySection } from "./sections/HomeStorySection";
import { HomeProductOfMonthSection } from "./sections/HomeProductOfMonthSection";

interface HomepageContentPropsI {
  productsWithPricing: ProductWithPricing[];
}

export function HomepageContent({
  productsWithPricing,
}: HomepageContentPropsI) {
  const products = mapProductsToCards(productsWithPricing);

  return (
    <div>
      <HomeHeroSection />
      <HomeProductsSection products={products} />
      <HomeStorySection blockIds={["design"]} />
      <HomeProductOfMonthSection />
      <HomeStorySection blockIds={["quality"]} background="white" />
      <HomeProcessSection />
      <HomeTrustGuaranteesSection />
      <HomeManifestoSection />
      <HomeCtaSection />
      <HomeReviewsSection />
      <HomeFaqSection />
    </div>
  );
}
