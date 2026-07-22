import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomepageContent } from "@/features/homepage/ui/HomepageContent";
import { getCachedProductsWithPricing } from "@/lib/supabase/server-cache";
import { StructuredData } from "@/features/seo/StructuredData";
import { faqPageSchema } from "@/features/seo/schemas/faq";
import { serviceSchema } from "@/features/seo/schemas/service";
import { howToSchema } from "@/features/seo/schemas/howto";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { HOME_FAQS } from "@/features/homepage/lib/constants/homepageContent";

export const revalidate = 1800;

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

  const faqEntries = HOME_FAQS.map(({ id }) => ({
    question: tFaq(`${id}.question`),
    answer: tFaq(`${id}.answer`),
  }));

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
      <StructuredData data={faqPageSchema(faqEntries)} />
      <StructuredData data={serviceSchema()} />
      <StructuredData data={howToSchema(howToSteps)} />
      <HomepageContent productsWithPricing={productsWithPricing} />
    </>
  );
}
