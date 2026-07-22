import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StampPage as StampMainPage } from "@/features/stamp/ui/StampPage";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("stamp.metadata");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/stamp",
    keywords: [...(t.raw("keywords") as string[]), ...PAGE_KEYWORDS.stamp],
    openGraph: {
      type: "website",
    },
  });
}

export default function StampPage() {
  return <StampMainPage />;
}
