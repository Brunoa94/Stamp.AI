"use client";

import { OrderSummary } from "@/features/checkout/paymentForm/OrderSummary";
import { TrustBanner } from "@/features/checkout/components";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";

export function OrderSummarySection() {
  return (
    <aside>
      <OrderSummary />

      {/* Trust Banner */}
      <TrustBanner />
    </aside>
  );
}
