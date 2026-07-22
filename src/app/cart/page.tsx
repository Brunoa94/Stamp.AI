import type { Metadata } from "next";
import { PAGE_METADATA_CONFIGS } from "@/features/seo/metadata";
import CartPageClient from "./CartPageClient";

/**
 * /cart Route - Shopping Cart
 *
 * Protected route for reviewing cart items before checkout.
 * SEO: noindex (user-specific content)
 */

export const metadata: Metadata = {
  title: PAGE_METADATA_CONFIGS.cart.title,
  description: PAGE_METADATA_CONFIGS.cart.description,
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
