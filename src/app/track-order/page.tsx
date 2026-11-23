import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { TrackOrderContent } from "@/features/orders/ui/TrackOrderContent";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_KEYWORDS } from "@/features/seo/config/keywords";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders.track.meta");

  return generatePageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/track-order",
    keywords: [...PAGE_KEYWORDS.orders],
    noindex: true,
  });
}

interface PropsI {
  searchParams: Promise<{ order?: string | string[] }>;
}

/** Guest order tracking; `?order=` (from the confirmation email) fills in the order number. */
export default async function TrackOrderPage({ searchParams }: PropsI) {
  const { order } = await searchParams;
  const initialOrderNumber = typeof order === "string" ? order.slice(0, 40) : "";

  return <TrackOrderContent initialOrderNumber={initialOrderNumber} />;
}
