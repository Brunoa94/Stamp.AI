import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StructuredData } from "@/features/seo/StructuredData";
import { pageSchema } from "@/features/seo/schemas/page";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { LegalDocument } from "@/features/legal/ui/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.returns.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/returns",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.returns],
  });
}

export default async function ReturnsPage() {
  const t = await getTranslations("legal.returns.meta");

  return (
    <>
      <StructuredData
        data={pageSchema(
          {
            name: t("title"),
            description: t("description"),
            url: `${SITE_URL}/returns`,
          },
          [
            { name: "Home", url: SITE_URL },
            { name: t("title"), url: `${SITE_URL}/returns` },
          ]
        )}
      />
      <LegalDocument pageKey="returns" />
    </>
  );
}
