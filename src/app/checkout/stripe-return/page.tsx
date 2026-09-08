import type { Metadata } from "next";
import StripeReturnClient from "./StripeReturnClient";

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
  return <StripeReturnClient />;
}
