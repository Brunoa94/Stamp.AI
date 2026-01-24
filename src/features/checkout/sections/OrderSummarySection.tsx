"use client";

import OrderSummary from "@/features/checkout/paymentForm/OrderSummary";
import { TrustBanner } from "@/features/checkout/components";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";

export function OrderSummarySection() {
  const customization = CheckoutSelectors.customization();
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const subtotal = CheckoutSelectors.subtotal();
  const shippingCost = CheckoutSelectors.shippingCost();
  const discount = CheckoutSelectors.discount();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();

  const { handleCompleteOrder } = useCheckoutSubscriberActions();

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
        onPromoCodeApply={(code) => {
          /** For Future implementation */
          console.log("Promo code applied:", code);
        }}
      />

      {/* Trust Banner */}
      <TrustBanner />
    </aside>
  );
}
