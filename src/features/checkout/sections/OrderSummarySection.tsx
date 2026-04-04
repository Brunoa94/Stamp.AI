"use client";

import { OrderSummary } from "@/features/checkout/OrderSummary";

export function OrderSummarySection() {
  return (
    <aside className="sticky top-24 h-fit space-y-6">
      <OrderSummary />
    </aside>
  );
}
