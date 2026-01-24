"use client";

import { CheckoutHeader } from "@/features/checkout/components";
import { CheckoutSelectors } from "@/features/checkout/context";

export function CheckoutHeaderSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const paymentStatus = CheckoutSelectors.paymentStatus();

  return (
    <CheckoutHeader
      shippingAddress={shippingAddress}
      isProcessingPayment={isProcessingPayment}
      paymentStatus={paymentStatus}
    />
  );
}
