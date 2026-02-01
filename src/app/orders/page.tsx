"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { OrdersContent } from "@/features/orders/ordersContent/OrdersContent";
import { OrdersLoadingSkeleton } from "@/features/orders/components/orderList";
import { theme } from "@/theme";

export default function OrdersPage() {
  return (
    <ProtectedRoute fallback={<OrdersLoadingSkeleton />}>
      <div className={theme.page.background}>
        <div className={theme.page.container}>
          <OrdersContent />
        </div>
      </div>
    </ProtectedRoute>
  );
}
