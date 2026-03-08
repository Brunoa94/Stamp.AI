"use client";

import { OrderSummary } from "@/features/checkout/OrderSummary";
import { TrustBanner } from "@/features/checkout/components";

export function OrderSummarySection() {
  return (
    <aside className="sticky top-24 h-fit space-y-6">
      <OrderSummary />
      <TrustBanner />
    </aside>
  );
}
