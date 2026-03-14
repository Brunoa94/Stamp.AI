"use client";

import { Lock } from "lucide-react";
import { checkoutTheme } from "@/theme";
import { useCheckoutSubscriberActions } from "@/features/checkout/context";
import { Button } from "@/features/ui/button";

export function CheckoutMobileFooter() {
  const m = checkoutTheme.mobile;
  const { handleCompleteOrder } = useCheckoutSubscriberActions();

  return (
    <div className={m.footer.wrapper}>
      <Button onClick={handleCompleteOrder} className={m.footer.button}>
        <Lock className="w-4 h-4" />
        Finalize &amp; Pay
      </Button>
    </div>
  );
}
