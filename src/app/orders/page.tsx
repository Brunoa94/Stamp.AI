import type { Metadata } from "next";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import OrdersContent from "@/features/orders/ui/OrdersContent";

export const metadata: Metadata = {
  title: "My Orders | Stamp AI",
  description: "Track your custom apparel orders and view order history.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
