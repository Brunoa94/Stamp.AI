"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import OrdersContent from "@/features/orders/ui/OrdersContent";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}
