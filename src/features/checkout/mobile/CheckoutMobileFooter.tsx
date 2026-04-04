"use client";

import { Lock } from "lucide-react";
import { checkoutTheme } from "@/theme";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";

export function CheckoutMobileFooter() {
  const m = checkoutTheme.mobile;
  const { handleCompleteOrder } = useCheckoutSubscriberActions();
  const selectedPaymentMethod = CheckoutSelectors.selectedPaymentMethod();
  const selectedUi = PAYMENT_CONFIRM_METHOD_UI[selectedPaymentMethod];

  return (
    <div className={m.footer.wrapper}>
      <Button
        onClick={handleCompleteOrder}
        className={`${m.footer.button} ${selectedUi.className}`}
      >
        <Lock className="w-4 h-4" />
        <selectedUi.Icon className="w-4 h-4" />
        {selectedUi.labelMobile}
      </Button>
    </div>
  );
}
