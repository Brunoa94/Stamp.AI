"use client";

import { useMemo } from "react";
import PaymentForm from "@/features/checkout/PaymentForm/PaymentForm";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { buildPrintifyLineItems } from "../mappers/printifyLineItemsMapper";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { SectionHeader } from "@/features/ui/section-header";
import { componentThemes } from "@/theme/components";

export function PaymentSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const testMode = CheckoutSelectors.testMode();
  const triggerPayment = CheckoutSelectors.triggerPayment();
  const orderAmount = CheckoutSelectors.orderAmount();
  const cartItems = CheckoutSelectors.cartItems();
  const selectedPaymentMethod = CheckoutSelectors.selectedPaymentMethod();

  const {
    setTestMode,
    setPaymentMethod,
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentSubmitComplete,
  } = useCheckoutSubscriberActions();

  // Build Printify line items from cart items
  const lineItems = useMemo(() => {
    const items = buildPrintifyLineItems(cartItems);

    return items;
  }, [cartItems]);

  console.log("✅ PaymentSection: Rendering payment form");

  return (
    <section className={componentThemes.checkout.paymentSection.container}>
      <SectionHeader title="Payment Details" />

      {/* Test Mode Toggle */}
      <div
        className={componentThemes.checkout.paymentSection.testModeContainer}
      >
        <Checkbox
          id="testMode"
          checked={testMode}
          onCheckedChange={(checked: boolean) => setTestMode(checked)}
        />
        <Label
          htmlFor="testMode"
          className={componentThemes.checkout.paymentSection.testModeLabel}
        >
          Test Mode (use predefined payment methods)
        </Label>
      </div>

      {shippingAddress ? (
        <PaymentForm
          lineItems={lineItems}
          amount={orderAmount}
          shippingAddress={shippingAddress}
          testMode={testMode}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          hideButton={true}
          triggerSubmit={triggerPayment}
          onSubmitComplete={handlePaymentSubmitComplete}
          initialPaymentMethod={selectedPaymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      ) : (
        <div className={componentThemes.checkout.paymentSection.emptyState}>
          <p className={componentThemes.checkout.paymentSection.emptyStateText}>
            Please fill in your billing address first
          </p>
        </div>
      )}
    </section>
  );
}
