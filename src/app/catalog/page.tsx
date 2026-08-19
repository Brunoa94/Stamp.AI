import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StructuredData } from "@/features/seo/StructuredData";
import { pageSchema } from "@/features/seo/schemas/page";
import { itemListSchema } from "@/features/seo/schemas/itemList";
import { mapProductsToSchemaData } from "@/features/seo/lib/productSchemaMapper";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { getCachedProductsWithPricing } from "@/lib/supabase/server-cache";
import { mapProductsToCatalogDisplay } from "@/features/catalog/lib/mappers/catalogProductMapper";
import { groupProductsByCategory } from "@/features/catalog/lib/helpers/groupProductsByCategory";
import { CatalogPageContent } from "@/features/catalog/ui/CatalogPageContent";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("catalog.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/catalog",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.catalog],
  });
}

export default async function CatalogPage() {
  const productsWithPricing = await getCachedProductsWithPricing();
  const tMeta = await getTranslations("catalog.meta");

  const sections = groupProductsByCategory(
    mapProductsToCatalogDisplay(productsWithPricing)
  );

  const productSchemaEntries = mapProductsToSchemaData(
    productsWithPricing,
    tMeta("description"),
    `${SITE_URL}/catalog`
  );

  return (
    <>
      <StructuredData
        data={pageSchema(
          {
            name: tMeta("title"),
            description: tMeta("description"),
            url: `${SITE_URL}/catalog`,
          },
          [
            { name: "Home", url: SITE_URL },
            { name: tMeta("title"), url: `${SITE_URL}/catalog` },
          ]
        )}
      />
      <StructuredData
        data={itemListSchema(tMeta("title"), productSchemaEntries)}
      />
      <CatalogPageContent sections={sections} />
    </>
  );
}
