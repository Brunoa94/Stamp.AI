import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StructuredData } from "@/features/seo/StructuredData";
import { pageSchema } from "@/features/seo/schemas/page";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { LegalDocument } from "@/features/legal/ui/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.shipping.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/shipping",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.shipping],
  });
}

export default async function ShippingPage() {
  const t = await getTranslations("legal.shipping.meta");

  return (
    <>
      <StructuredData
        data={pageSchema(
          {
            name: t("title"),
            description: t("description"),
            url: `${SITE_URL}/shipping`,
          },
          [
            { name: "Home", url: SITE_URL },
            { name: t("title"), url: `${SITE_URL}/shipping` },
          ]
        )}
      />
      <LegalDocument pageKey="shipping" />
    </>
  );
}
