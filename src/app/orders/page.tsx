import type { Metadata } from "next";
import OrdersPageClient from "./OrdersPageClient";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track your custom apparel orders and view order history.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
