import { HeroSection } from "@/features/homepage-brutalist/ui/sections/HeroSection";
import { ProductsSection } from "@/features/homepage-brutalist/ui/sections/ProductsSection";
import { ProcessSection } from "@/features/homepage-brutalist/ui/sections/ProcessSection";
import { AboutSection } from "@/features/homepage-brutalist/ui/sections/AboutSection";
import { CtaSection } from "@/features/homepage-brutalist/ui/sections/CtaSection";
import { ReviewsSection } from "@/features/homepage-brutalist/ui/sections/ReviewsSection";
import { FaqSection } from "@/features/homepage-brutalist/ui/sections/FaqSection";
import { getCachedFeaturedProductsWithPricing } from "@/lib/supabase/server-cache";

/**
 * Brutalist Homepage
 *
 * Orchestrates all brutalist homepage sections following the Superdesign draft
 * Design: "STAMP.AI | Refined Cart Interface"
 *
 * Note: Navbar, Footer, and GrainOverlay are in the root layout
 *
 * Server Component: Fetches product data with 30-minute cache
 */

// Revalidate page every 30 minutes
export const revalidate = 1800

export default async function Home() {
  // Fetch featured products with selling prices on server (cached for 30 min)
  const productsWithPricing = await getCachedFeaturedProductsWithPricing('NL')

  return (
    <div className="min-h-screen bg-concrete text-ink font-space">
      <HeroSection />
      <ProductsSection productsWithPricing={productsWithPricing} />
      <ProcessSection />
      <AboutSection />
      <CtaSection />
      <ReviewsSection />
      <FaqSection />
    </div>
  );
}
