import type { Metadata } from "next";
import { TrackOrderContent } from "@/features/orders/ui/TrackOrderContent";
import { generatePageMetadata } from "@/features/seo/metadata/pageMetadata";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";

const { keywords, ...trackOrderConfig } = PAGE_METADATA_CONFIGS.trackOrder;

export const metadata: Metadata = generatePageMetadata({ ...trackOrderConfig, keywords: [...keywords] });

interface PropsI {
  searchParams: Promise<{ order?: string | string[] }>;
}

/** Guest order tracking; `?order=` (from the confirmation email) fills in the order number. */
export default async function TrackOrderPage({ searchParams }: PropsI) {
  const { order } = await searchParams;
  const initialOrderNumber = typeof order === "string" ? order.slice(0, 40) : "";

  return <TrackOrderContent initialOrderNumber={initialOrderNumber} />;
}
