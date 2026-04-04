"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import OrdersContent from "@/features/orders/OrdersContent";
import { OrdersLoadingSkeleton } from "@/features/orders/OrdersStates";
import { theme } from "@/theme";

export default function OrdersPage() {
  return (
    <ProtectedRoute fallback={<OrdersLoadingSkeleton />}>
      <main className={theme.page.container}>
        <OrdersContent />
      </main>
    </ProtectedRoute>
  );
}
