import type { Metadata } from "next";
import PaypalReturnClient from "./PaypalReturnClient";

/**
 * /checkout/paypal-return Route - PayPal Payment Return
 *
 * Payment callback page after PayPal checkout.
 * SEO: noindex (transactional page)
 */

export const metadata: Metadata = {
  title: "Processing Payment | Stamp AI",
  description: "Processing your PayPal payment. Please wait...",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaypalReturnPage() {
  return <PaypalReturnClient />;
}
