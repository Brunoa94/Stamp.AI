import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StructuredData } from "@/features/seo/StructuredData";
import { pageSchema } from "@/features/seo/schemas/page";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { LegalDocument } from "@/features/legal/ui/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.cookies.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/cookies",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.cookies],
  });
}

export default async function CookiesPage() {
  const t = await getTranslations("legal.cookies.meta");

  return (
    <>
      <StructuredData
        data={pageSchema(
          {
            name: t("title"),
            description: t("description"),
            url: `${SITE_URL}/cookies`,
          },
          [
            { name: "Home", url: SITE_URL },
            { name: t("title"), url: `${SITE_URL}/cookies` },
          ]
        )}
      />
      <LegalDocument pageKey="cookies" />
    </>
  );
}
