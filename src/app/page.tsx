import { getTranslations } from "next-intl/server";
import { HomepageContent } from "@/features/homepage/ui/HomepageContent";
import { getCachedProductsWithPricing } from "@/lib/supabase/server-cache";

/**
 * Luxury Homepage (v2)
 *
 * Main homepage route ("/") now uses the v2 luxury design system.
 */

// Revalidate page every 30 minutes
export const revalidate = 1800;

export async function generateMetadata() {
  const t = await getTranslations("home.meta");
  return {
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords") as string[],
  };
}

export default async function Home() {
  const productsWithPricing = await getCachedProductsWithPricing();

  return <HomepageContent productsWithPricing={productsWithPricing} />;
}
