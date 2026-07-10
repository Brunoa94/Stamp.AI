import { HomepageContent } from "@/features/homepage-v2/ui/HomepageContent";
import { getCachedFeaturedProductsWithPricing } from "@/lib/supabase/server-cache";

/**
 * Luxury Homepage (v2)
 *
 * Refactor of "/" in the luxury design system. Same content and data flow:
 * featured products fetched server-side with a 30-minute cache.
 */

export const revalidate = 1800;

export const metadata = {
  title: "Stamp AI | Design Synthesis Atelier",
  description:
    "AI-powered design synthesis for premium apparel. Create archive-quality graphics in seconds.",
};

export default async function HomepageV2Page() {
  const productsWithPricing = await getCachedFeaturedProductsWithPricing("NL");

  return <HomepageContent productsWithPricing={productsWithPricing} />;
}
