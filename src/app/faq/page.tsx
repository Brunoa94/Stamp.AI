import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StructuredData } from "@/features/seo/StructuredData";
import { faqPageSchema } from "@/features/seo/schemas/faq";
import { pageSchema } from "@/features/seo/schemas/page";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";
import { SITE_URL } from "@/features/seo/config/site";
import { FaqPageContent } from "@/features/faq/ui/FaqPageContent";
import { FAQ_CATEGORIES } from "@/features/faq/lib/constants/faqContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/faq",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.faq],
  });
}

export default async function FaqPage() {
  const tMeta = await getTranslations("faq.meta");
  const tItems = await getTranslations("faq.items");

  const faqEntries = FAQ_CATEGORIES.flatMap((category) =>
    category.items.map((itemId) => ({
      question: tItems(`${itemId}.question`),
      answer: tItems(`${itemId}.answer`),
    }))
  );

  return (
    <>
      <StructuredData
        data={faqPageSchema(faqEntries, `${SITE_URL}/faq/#faq`)}
      />
      <StructuredData
        data={pageSchema(
          {
            name: tMeta("title"),
            description: tMeta("description"),
            url: `${SITE_URL}/faq`,
          },
          [
            { name: "Home", url: SITE_URL },
            { name: tMeta("title"), url: `${SITE_URL}/faq` },
          ]
        )}
      />
      <FaqPageContent />
    </>
  );
}
