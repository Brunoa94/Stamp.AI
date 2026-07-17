import { getTranslations } from "next-intl/server";
import { HomepageContent } from "@/features/homepage/ui/HomepageContent";
import { getCachedProductsWithPricing } from "@/lib/supabase/server-cache";
import { StructuredData } from "@/features/seo/StructuredData";
import { faqPageSchema } from "@/features/seo/jsonLd";
import { HOME_FAQS } from "@/features/homepage/lib/constants/homepageContent";

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

  const tFaq = await getTranslations("home.faq.items");
  const faqEntries = HOME_FAQS.map(({ id }) => ({
    question: tFaq(`${id}.question`),
    answer: tFaq(`${id}.answer`),
  }));

  return (
    <>
      <StructuredData data={faqPageSchema(faqEntries)} />
      <HomepageContent productsWithPricing={productsWithPricing} />
    </>
  );
}
