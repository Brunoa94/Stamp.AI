/**
 * HomepageContent
 *
 * Server-side orchestrator for the luxury homepage: maps the server-fetched
 * products and composes all sections. Navbar and footer come from the root
 * layout chrome — not re-added here.
 *
 * Section order follows the marketing line: value proposition (hero),
 * product showcase, brand story, how it works, trust, social proof, FAQ
 * and a closing call to action.
 */

import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import { mapProductsToCards } from "../lib/mappers/productCardMapper";
import { HomeHeroSection } from "./sections/HomeHeroSection";
import { HomeProductsSection } from "./sections/HomeProductsSection";
import { HomeStorySection } from "./sections/HomeStorySection";
import { HomeProcessSection } from "./sections/HomeProcessSection";
import { HomeTrustGuaranteesSection } from "./sections/HomeTrustGuaranteesSection";
import { HomeReviewsSection } from "./sections/HomeReviewsSection";
import { HomeFaqSection } from "./sections/HomeFaqSection";
import { HomeCtaSection } from "./sections/HomeCtaSection";

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
      <HomeStorySection />
      <HomeProcessSection />
      <HomeTrustGuaranteesSection />
      <HomeReviewsSection />
      <HomeFaqSection />
      <HomeCtaSection />
    </div>
  );
}
