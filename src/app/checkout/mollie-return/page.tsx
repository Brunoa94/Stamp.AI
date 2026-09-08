import type { Metadata } from "next";
import MollieReturnClient from "./MollieReturnClient";

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
  return <MollieReturnClient />;
}
