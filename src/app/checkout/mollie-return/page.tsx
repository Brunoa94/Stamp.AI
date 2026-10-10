import type { Metadata } from "next";
import { Suspense } from "react";
import { MollieReturnSection } from "@/features/checkout/ui/sections/PaymentReturn/MollieReturnSection";

/**
 * /checkout/mollie-return Route - Mollie Payment Return
 *
 * Payment callback page after Mollie checkout.
 * SEO: noindex (transactional page)
 */

export const metadata: Metadata = {
  title: "Processing Payment",
  description: "Processing your payment. Please wait...",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MollieReturnPage() {
  // useSearchParams() requires a Suspense boundary for static prerendering
  return (
    <Suspense fallback={null}>
      <MollieReturnSection />
    </Suspense>
  );
}
