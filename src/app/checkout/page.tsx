import type { Metadata } from "next";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata/pageConfigs";
import CheckoutPageClient from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.checkout.title,
  description: PAGE_METADATA_CONFIGS.checkout.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
