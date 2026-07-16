/**
 * CartOrderSummaryFooter
 *
 * Checkout call-to-action plus the shipping estimate and secure-payment
 * reassurance beneath the cart summary breakdown.
 */

"use client";

import { ArrowRight, Truck, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

interface CartOrderSummaryFooterPropsI {
  onCheckout: () => void;
}

export function CartOrderSummaryFooter({
  onCheckout,
}: CartOrderSummaryFooterPropsI) {
  const t = useTranslations("cart.summary");

  return (
    <div className="mt-8 space-y-6">
      <Button
        onClick={onCheckout}
        variant="secondary-brown"
        className="group w-full font-heading"
      >
        {t("proceedToCheckout")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>

      <div className="flex items-center gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 px-4 py-4">
        <Truck
          className="h-5 w-5 text-(--color-stamp-taupe)"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <Span variant="micro" className="block text-(--color-stamp-taupe)">
            {t("estimatedArrival")}
          </Span>
          <Span
            unstyled
            className="text-lg font-bold uppercase tracking-[0.15em]"
          >
            {t("arrivalWindow")}
          </Span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-(--color-stamp-taupe)">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <Span variant="micro">{t("secureTransactions")}</Span>
      </div>
    </div>
  );
}
