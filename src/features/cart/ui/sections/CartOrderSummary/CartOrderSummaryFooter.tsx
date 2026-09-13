/**
 * CartOrderSummaryFooter
 *
 * Checkout call-to-action plus the shipping estimate and secure-payment
 * reassurance beneath the cart summary breakdown.
 */

import { ArrowRight, Lock, Truck } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { FooterPaymentIcons } from "@/features/ui/trust/FooterPaymentIcons";

interface CartOrderSummaryFooterPropsI {
  onCheckout: () => void;
  canCheckout?: boolean;
}

export function CartOrderSummaryFooter({
  onCheckout,
  canCheckout = true,
}: CartOrderSummaryFooterPropsI) {
  return (
    <div className="mt-8 space-y-6">
      <Button
        onClick={onCheckout}
        variant="primary"
        className="group w-full"
        disabled={!canCheckout}
      >
        <Lock className="h-4 w-4" aria-hidden="true" />
        Proceed to Checkout
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

      <div className="flex items-center gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 px-4 py-4">
        <Truck
          className="h-5 w-5 text-(--color-stamp-taupe)"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <Span variant="label" className="block text-(--color-stamp-taupe)">
            Estimated Arrival
          </Span>
          <Span variant="value">5-8 Business Days</Span>
        </div>
      </div>

      {/* Trust signals - payment icons and secure checkout */}
      <FooterPaymentIcons />
    </div>
  );
}
