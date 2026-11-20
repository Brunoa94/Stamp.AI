import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StructuredData } from "@/features/seo/StructuredData";
import { pageSchema } from "@/features/seo/schemas/page";
import { toLanguageTag } from "@/i18n/locales";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { LegalDocument } from "@/features/legal/ui/LegalDocument";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.security.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/security",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.security],
  });
}

export default async function SecurityPage() {
  const t = await getTranslations("legal.security.meta");

  return (
    <>
      <StructuredData
        data={pageSchema(
          {
            name: t("title"),
            description: t("description"),
            url: `${SITE_URL}/security`,
            inLanguage: toLanguageTag(await getLocale()),
          },
          [
            { name: "Home", url: SITE_URL },
            { name: t("title"), url: `${SITE_URL}/security` },
          ]
        )}
      />
      <LegalDocument pageKey="security" />
    </>
  );
}
