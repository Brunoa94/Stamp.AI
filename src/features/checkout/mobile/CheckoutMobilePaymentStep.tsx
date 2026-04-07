"use client";

import { useMemo } from "react";
import PaymentForm from "@/features/checkout/paymentForm/PaymentForm";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { buildPrintifyLineItems } from "@/features/checkout/mappers/printifyLineItemsMapper";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { componentThemes } from "@/theme/components";

export function CheckoutMobilePaymentStep() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const testMode = CheckoutSelectors.testMode();
  const triggerPayment = CheckoutSelectors.triggerPayment();
  const orderAmount = CheckoutSelectors.orderAmount();
  const cartItems = CheckoutSelectors.cartItems();
  const selectedPaymentMethod = CheckoutSelectors.selectedPaymentMethod();
  const checkoutOrderId = CheckoutSelectors.checkoutOrderId();

  const {
    setTestMode,
    setPaymentMethod,
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentSubmitComplete,
  } = useCheckoutSubscriberActions();

  const lineItems = useMemo(
    () => buildPrintifyLineItems(cartItems),
    [cartItems],
  );

  const ct = componentThemes.checkout;

  return (
    <div>
      {/* Test mode toggle */}
      <div className={ct.paymentSection.testModeContainer}>
        <Checkbox
          id="mobile-testMode"
          checked={testMode}
          onCheckedChange={(checked: boolean) => setTestMode(checked)}
        />
        <Label
          htmlFor="mobile-testMode"
          className={ct.paymentSection.testModeLabel}
        >
          Test Mode
        </Label>
      </div>

      {shippingAddress ? (
        <PaymentForm
          lineItems={lineItems}
          amount={orderAmount}
          shippingAddress={shippingAddress}
          orderId={checkoutOrderId || undefined}
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
        <p className="text-base text-slate-500 italic text-center py-4">
          Please complete your shipping address first.
        </p>
      )}
    </div>
  );
}
