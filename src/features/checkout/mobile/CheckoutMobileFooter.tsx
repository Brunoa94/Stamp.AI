"use client";

import { Lock } from "lucide-react";
import { checkoutTheme } from "@/theme";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";
import { PayPalButton } from "../PayPalButton/PayPalButton";
import { MollieButton } from "../MollieButton";
import { useCallback } from "react";
import type { PayPalSuccessDetailsI } from "../PayPalButton/usePayPalButton";

export function CheckoutMobileFooter() {
  const m = checkoutTheme.mobile;
  const { handleCompleteOrder, handlePaymentSuccess, handlePaymentError } =
    useCheckoutSubscriberActions();
  const selectedPaymentMethod = CheckoutSelectors.selectedPaymentMethod();
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const lineItems = CheckoutSelectors.lineItems();
  const testMode = CheckoutSelectors.testMode();
  const orderAmount = CheckoutSelectors.orderAmount();
  const selectedUi = PAYMENT_CONFIRM_METHOD_UI[selectedPaymentMethod];

  const handlePayPalSuccessCallback = useCallback(
    async (details: PayPalSuccessDetailsI, items: typeof lineItems) => {
      await handlePaymentSuccess(
        {
          id: details.id,
          status: details.status,
          paypal_capture_id: details.captureId,
          paypal_payer_email: details.payerEmail,
        },
        items,
      );
    },
    [handlePaymentSuccess],
  );

  return (
    <div className={m.footer.wrapper}>
      {selectedPaymentMethod === "stripe" && (
        <Button
          onClick={handleCompleteOrder}
          disabled={!shippingAddress || isProcessingPayment}
          className={`${m.footer.button} ${selectedUi.className}`}
        >
          <Lock className="w-4 h-4" />
          <selectedUi.Icon className="w-4 h-4" />
          {isProcessingPayment ? "Processing..." : selectedUi.labelMobile}
        </Button>
      )}

      {selectedPaymentMethod === "paypal" && shippingAddress && (
        <PayPalButton
          amount={orderAmount}
          lineItems={lineItems}
          shippingAddress={shippingAddress}
          testMode={testMode}
          onSuccess={handlePayPalSuccessCallback}
          onError={handlePaymentError}
          disabled={isProcessingPayment}
        />
      )}

      {selectedPaymentMethod === "mollie" && shippingAddress && (
        <MollieButton
          amount={orderAmount}
          lineItems={lineItems}
          shippingAddress={shippingAddress}
          testMode={testMode}
          onError={handlePaymentError}
          disabled={isProcessingPayment}
        />
      )}

      {!shippingAddress && selectedPaymentMethod !== "stripe" && (
        <Button
          disabled
          className={`${m.footer.button} opacity-50 cursor-not-allowed`}
        >
          <Lock className="w-4 h-4" />
          <selectedUi.Icon className="w-4 h-4" />
          {selectedUi.labelMobile}
        </Button>
      )}
    </div>
  );
}
