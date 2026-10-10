import type { Metadata } from "next";
import { Suspense } from "react";
import { StripeReturnSection } from "@/features/checkout/ui/sections/PaymentReturn/StripeReturnSection";

/**
 * /checkout/stripe-return Route - Stripe Payment Return
 *
 * Payment callback page after Stripe checkout.
 * SEO: noindex (transactional page)
 */

export const metadata: Metadata = {
  title: "Processing Payment",
  description: "Processing your Stripe payment. Please wait...",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StripeReturnPage() {
  // useSearchParams() requires a Suspense boundary for static prerendering
  return (
    <Suspense fallback={null}>
      <StripeReturnSection />
    </Suspense>
  );
}
