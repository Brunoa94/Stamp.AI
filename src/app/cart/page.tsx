import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your custom AI-designed apparel before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageClient />;
}
