"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import OrdersContent from "@/features/orders/ui/OrdersContent";
import { OrdersLoadingSkeleton } from "@/features/orders/ui/OrdersStates/OrdersLoadingSkeleton";
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
