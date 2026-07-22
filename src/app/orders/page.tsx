import type { Metadata } from "next";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";
import OrdersPageClient from "./OrdersPageClient";

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.orders.title,
  description: PAGE_METADATA_CONFIGS.orders.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
