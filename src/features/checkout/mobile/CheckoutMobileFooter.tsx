"use client";

import { Lock } from "lucide-react";
import { checkoutTheme } from "@/theme";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";
import { CustomPayPalButton } from "../PayPalButton/CustomPayPalButton";

export function CheckoutMobileFooter() {
  const m = checkoutTheme.mobile;
  const { handlePaymentError } = useCheckoutSubscriberActions();
  const selectedPaymentMethod = CheckoutSelectors.selectedPaymentMethod();
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const lineItems = CheckoutSelectors.lineItems();
  const orderAmount = CheckoutSelectors.orderAmount();
  const selectedUi = PAYMENT_CONFIRM_METHOD_UI[selectedPaymentMethod];

  return (
    <div className={m.footer.wrapper}>
      {selectedPaymentMethod === "stripe" && (
        <Button
          type="submit"
          form="stripe-payment-form"
          disabled={!shippingAddress || isProcessingPayment}
          className={`${m.footer.button} ${selectedUi.className}`}
        >
          <Lock className="w-4 h-4" />
          <selectedUi.Icon className="w-4 h-4" />
          {isProcessingPayment ? "Processing..." : selectedUi.labelMobile}
        </Button>
      )}

      {selectedPaymentMethod === "paypal" && shippingAddress && (
        <CustomPayPalButton
          amount={orderAmount}
          lineItems={lineItems}
          shippingAddress={shippingAddress}
          onError={handlePaymentError}
          disabled={isProcessingPayment}
          variant="mobile"
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
