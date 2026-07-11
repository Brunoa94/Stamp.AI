import { HomepageContent } from "@/features/homepage/ui/HomepageContent";
import { getCachedFeaturedProductsWithPricing } from "@/lib/supabase/server-cache";

/**
 * Luxury Homepage (v2)
 *
 * Main homepage route ("/") now uses the v2 luxury design system.
 */

// Revalidate page every 30 minutes
export const revalidate = 1800;

export const metadata = {
  title: "Stamp AI | Design Synthesis Atelier",
  description:
    "AI-powered design synthesis for premium apparel. Create archive-quality graphics in seconds.",
};

export default async function Home() {
  const productsWithPricing = await getCachedFeaturedProductsWithPricing("NL");

  return <HomepageContent productsWithPricing={productsWithPricing} />;
}
