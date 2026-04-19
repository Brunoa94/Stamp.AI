import { PageDividers } from "@/features/ui/page-dividers";
import { paymentSuccessTheme } from "@/theme";
import { Loader2 } from "lucide-react";
import React from "react";
import type { PaymentMethodT } from "@/types/payment";

interface VerifyPaymentProps {
  paymentMethod: PaymentMethodT;
}

const paymentMethodNames: Record<PaymentMethodT, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  mollie: "Mollie",
};

const VerifyPayment = ({ paymentMethod }: VerifyPaymentProps) => {
  const providerName = paymentMethodNames[paymentMethod] || "the payment provider";

  return (
    <div className={paymentSuccessTheme.page}>
      <PageDividers />
      <div className={paymentSuccessTheme.wrapper}>
        <section
          className={paymentSuccessTheme.card}
          aria-label="Verifying payment"
        >
          <div className={paymentSuccessTheme.topAccent} aria-hidden="true" />
          <div className={paymentSuccessTheme.iconWrapper} aria-hidden="true">
            <Loader2 className="w-12 h-12 animate-spin" />
          </div>
          <h1 className={paymentSuccessTheme.title}>Verifying Payment</h1>
          <p className={paymentSuccessTheme.subtitle}>
            Please wait while we confirm your payment with {providerName}...
          </p>
        </section>
      </div>
    </div>
  );
};

export default VerifyPayment;
