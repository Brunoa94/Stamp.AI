"use client";

import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import OrdersTerminalContent from "@/features/orders/ui/OrdersTerminalContent";
import { OrdersLoadingSkeleton } from "@/features/orders/ui/components/OrdersStates/OrdersLoadingSkeleton";

export default function OrdersPage() {
  return (
    <ProtectedRoute fallback={<OrdersLoadingSkeleton />}>
      <OrdersTerminalContent />
    </ProtectedRoute>
  );
}
