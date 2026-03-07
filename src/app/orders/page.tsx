"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { OrdersContent } from "@/features/orders/ordersContent/OrdersContent";
import { OrdersLoadingSkeleton } from "@/features/orders/orderList";
import { theme } from "@/theme";

export default function OrdersPage() {
  return (
    <ProtectedRoute fallback={<OrdersLoadingSkeleton />}>
      <div className={theme.page.container}>
        <OrdersContent />
      </div>
    </ProtectedRoute>
  );
}
