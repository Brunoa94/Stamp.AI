import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StampPage as StampMainPage } from "@/features/stamp/ui/StampPage";
import { generatePageMetadata } from "@/features/seo/metadata";
import { PAGE_KEYWORDS } from "@/features/seo/config";

/**
 * /stamp Route - AI Design Studio
 *
 * The main product creation flow where users:
 * 1. Upload reference images or start from scratch
 * 2. Describe their design with AI prompts
 * 3. Generate print-ready artwork
 * 4. Customize product options
 * 5. Add to cart and checkout
 *
 * SEO: High-priority page with product-focused keywords
 */

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
