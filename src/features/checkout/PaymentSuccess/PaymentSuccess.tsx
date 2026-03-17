"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/features/ui/button";
import { PaymentSuccessDetailsGrid } from "@/features/checkout/PaymentSuccess/PaymentSuccessDetailsGrid";
import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";
import { PageDividers } from "@/features/ui/page-dividers";
import { paymentSuccessTheme } from "@/theme/components";
import type { PaymentSuccessDetailsI } from "@/types/payment";

interface Props {
  details: PaymentSuccessDetailsI | null;
  onCreateAnother: () => void;
}

const PaymentSuccess = ({ details, onCreateAnother }: Props) => {
  const orderNumber = details?.orderNumber ?? "—";
  const totalPaid = details?.totalPaid ?? "—";
  const estimatedDelivery = details?.estimatedDelivery ?? "7–10 business days";
  const confirmationEmail = details?.confirmationEmail;

  return (
    <div className={paymentSuccessTheme.page}>
      <FluidInkDriftBackground />
      <PageDividers />

      <div className={paymentSuccessTheme.wrapper}>
        <section
          className={paymentSuccessTheme.card}
          aria-label="Payment confirmation"
        >
          {/* Top accent bar */}
          <div className={paymentSuccessTheme.topAccent} aria-hidden="true" />

          {/* Animated success icon */}
          <div className={paymentSuccessTheme.iconWrapper} aria-hidden="true">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          {/* Heading */}
          <h1 className={paymentSuccessTheme.title}>Order Confirmed</h1>
          <p className={paymentSuccessTheme.subtitle}>
            Your custom masterpiece is officially in the queue. We&apos;re
            warming up the ink jets right now.
          </p>

          {/* Order details grid */}
          <PaymentSuccessDetailsGrid
            orderNumber={orderNumber}
            estimatedDelivery={estimatedDelivery}
            totalPaid={totalPaid}
            status="Processing"
          />

          {/* CTAs */}
          <div className={paymentSuccessTheme.ctaStack}>
            <Button asChild className={paymentSuccessTheme.primaryBtn}>
              <Link href="/orders">Track Your Order</Link>
            </Button>
            <Button
              variant="outline"
              onClick={onCreateAnother}
              className={paymentSuccessTheme.secondaryBtn}
            >
              Create Another Order
            </Button>
          </div>

          {/* Confirmation email note */}
          {confirmationEmail && (
            <p className={paymentSuccessTheme.emailNote}>
              A confirmation email has been sent to {confirmationEmail}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default PaymentSuccess;
