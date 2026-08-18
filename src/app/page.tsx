import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomepageContent } from "@/features/homepage/ui/HomepageContent";
import { getCachedProductsWithPricing } from "@/lib/supabase/server-cache";
import { StructuredData } from "@/features/seo/StructuredData";
import { faqPageSchema } from "@/features/seo/schemas/faq";
import { serviceSchema } from "@/features/seo/schemas/service";
import { howToSchema } from "@/features/seo/schemas/howto";
import { productSchema } from "@/features/seo/schemas/product";
import { mapProductsToSchemaData } from "@/features/seo/lib/productSchemaMapper";
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

  const tMeta = await getTranslations("home.meta");
  const tFaq = await getTranslations("home.faq.items");
  const tProcess = await getTranslations("home.process.steps");

  const productSchemaEntries = mapProductsToSchemaData(
    productsWithPricing,
    tMeta("description")
  );

  const faqEntries = HOME_FAQS.map(({ id }) => ({
    question: tFaq(`${id}.question`),
    answer: tFaq(`${id}.answer`),
  }));

  const howToSteps = [
    {
      name: tProcess("step-upload.title"),
      text: tProcess("step-upload.description"),
    },
    {
      name: tProcess("step-describe.title"),
      text: tProcess("step-describe.description"),
    },
    {
      name: tProcess("step-generate.title"),
      text: tProcess("step-generate.description"),
    },
    {
      name: tProcess("step-results.title"),
      text: tProcess("step-results.description"),
    },
    {
      name: tProcess("step-product.title"),
      text: tProcess("step-product.description"),
    },
    {
      name: tProcess("step-customize.title"),
      text: tProcess("step-customize.description"),
    },
    {
      name: tProcess("step-create.title"),
      text: tProcess("step-create.description"),
    },
    {
      name: tProcess("step-checkout.title"),
      text: tProcess("step-checkout.description"),
    },
  ];

  return (
    <>
      <StructuredData data={faqPageSchema(faqEntries)} />
      <StructuredData data={serviceSchema()} />
      <StructuredData data={howToSchema(howToSteps)} />
      {productSchemaEntries.map((entry) => (
        <StructuredData key={entry.name} data={productSchema(entry)} />
      ))}
      <HomepageContent productsWithPricing={productsWithPricing} />
    </>
  );
}
