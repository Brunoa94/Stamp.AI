import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomepageContent } from "@/features/homepage/ui/HomepageContent";
import { getCachedProductsWithPricing } from "@/lib/supabase/server-cache";
import { StructuredData } from "@/features/seo/StructuredData";
import {
  faqPageSchema,
  serviceSchema,
  howToSchema,
} from "@/features/seo/jsonLd";
import { generatePageMetadata } from "@/features/seo/metadata";
import { PAGE_KEYWORDS, SITE_URL } from "@/features/seo/config";
import { HOME_FAQS } from "@/features/homepage/lib/constants/homepageContent";

/**
 * Homepage - Main landing page
 *
 * SEO optimized with:
 * - Rich Open Graph and Twitter Cards
 * - FAQ structured data for rich snippets
 * - Service schema for brand visibility
 * - HowTo schema for the design process
 */

// Revalidate page every 30 minutes for fresh content
export const revalidate = 1800;

/**
 * Homepage metadata with full SEO optimization
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.home],
    openGraph: {
      type: "website",
      url: SITE_URL,
    },
  });
}

export default async function Home() {
  const productsWithPricing = await getCachedProductsWithPricing();

  const tFaq = await getTranslations("home.faq.items");
  const tProcess = await getTranslations("home.process.steps");

  // Build FAQ entries for structured data
  const faqEntries = HOME_FAQS.map(({ id }) => ({
    question: tFaq(`${id}.question`),
    answer: tFaq(`${id}.answer`),
  }));

  // Build HowTo steps for the design process
  const howToSteps = [
    {
      name: tProcess("step-studio.title"),
      text: tProcess("step-studio.description"),
    },
    {
      name: tProcess("step-synthesis.title"),
      text: tProcess("step-synthesis.description"),
    },
    {
      name: tProcess("step-material.title"),
      text: tProcess("step-material.description"),
    },
    {
      name: tProcess("step-production.title"),
      text: tProcess("step-production.description"),
    },
    {
      name: tProcess("step-quality.title"),
      text: tProcess("step-quality.description"),
    },
    {
      name: tProcess("step-delivery.title"),
      text: tProcess("step-delivery.description"),
    },
  ];

  return (
    <>
      {/* FAQ structured data for rich snippets in search results */}
      <StructuredData data={faqPageSchema(faqEntries)} />
      {/* Service schema for brand visibility */}
      <StructuredData data={serviceSchema()} />
      {/* HowTo schema for the design process */}
      <StructuredData data={howToSchema(howToSteps)} />
      <HomepageContent productsWithPricing={productsWithPricing} />
    </>
  );
}
