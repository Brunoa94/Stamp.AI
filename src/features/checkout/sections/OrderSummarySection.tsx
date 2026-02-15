"use client";

import { OrderSummary } from "@/features/checkout/paymentForm/OrderSummary";
import { TrustBanner } from "@/features/checkout/components";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";

export function OrderSummarySection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const subtotal = CheckoutSelectors.subtotal();
  const shippingCost = CheckoutSelectors.shippingCost();
  const discount = CheckoutSelectors.discount();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const customization = CheckoutSelectors.customization();
  const orderItems = CheckoutSelectors.orderItems();

  const { handleCompleteOrder } = useCheckoutSubscriberActions();
  // Don't render if we don't have the required data
  if (!customization) {
    console.log("⚠️ OrderSummarySection: No customization, returning empty");
    return <></>;
  }

  return (
    <aside>
      <OrderSummary
        customization={customization}
        shippingAddress={
          shippingAddress || {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            country: "US",
            region: "",
            address1: "",
            address2: "",
            city: "",
            zip: "",
          }
        }
        orderAmount={subtotal}
        shippingCost={shippingCost}
        discount={discount}
        onEditShipping={() => {}}
        onCompleteOrder={handleCompleteOrder}
        isProcessingPayment={isProcessingPayment}
        onPromoCodeApply={(code: string) => {
          /** For Future implementation */
          console.log("Promo code applied:", code);
        }}
      />

      {/* Trust Banner */}
      <TrustBanner />
    </aside>
  );
}
