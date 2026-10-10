import type { Metadata } from "next";
import { Suspense } from "react";
import { PayPalReturnSection } from "@/features/checkout/ui/sections/PaymentReturn/PayPalReturnSection";

/**
 * /checkout/paypal-return Route - PayPal Payment Return
 *
 * Payment callback page after PayPal checkout.
 * SEO: noindex (transactional page)
 */

export const metadata: Metadata = {
  title: "Processing Payment",
  description: "Processing your PayPal payment. Please wait...",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaypalReturnPage() {
  // useSearchParams() requires a Suspense boundary for static prerendering
  return (
    <Suspense fallback={null}>
      <PayPalReturnSection />
    </Suspense>
  );
}
