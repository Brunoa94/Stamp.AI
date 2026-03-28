"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";
import { PageDividers } from "@/features/ui/page-dividers";
import { PaymentSuccess, PaymentError } from "@/features/checkout/components";
import { MollieService } from "@/services/mollieService";
import {
  isMolliePaymentPaid,
  isMolliePaymentFailed,
  isMolliePaymentPending,
} from "@/lib/mollie";
import type { MolliePaymentStatus } from "@/lib/mollie";
import { paymentSuccessTheme, paymentErrorTheme } from "@/theme/components";

type PageStatus = "loading" | "success" | "failed" | "pending" | "error";

export default function MollieReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<MolliePaymentStatus | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        // Get payment ID from sessionStorage (saved before redirect)
        const storedPaymentId = sessionStorage.getItem("mollie_payment_id");

        if (!storedPaymentId) {
          setStatus("error");
          setErrorMessage("No payment information found. Please try again.");
          return;
        }

        setPaymentId(storedPaymentId);

        // Verify payment status with edge function
        const result = await MollieService.verifyPayment({
          paymentId: storedPaymentId,
        });

        setPaymentStatus(result.status);

        if (isMolliePaymentPaid(result.status)) {
          setStatus("success");
          // Clear sessionStorage
          sessionStorage.removeItem("mollie_payment_id");
          sessionStorage.removeItem("mollie_line_items");
          sessionStorage.removeItem("mollie_shipping_address");
        } else if (isMolliePaymentFailed(result.status)) {
          setStatus("failed");
          sessionStorage.removeItem("mollie_payment_id");
        } else if (isMolliePaymentPending(result.status)) {
          setStatus("pending");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setStatus("error");
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to verify payment status",
        );
      }
    };

    verifyPayment();
  }, []);

  const handleRetryPayment = () => {
    router.push("/checkout");
  };

  const handleViewOrders = () => {
    router.push("/orders");
  };

  const handleCreateAnother = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className={paymentSuccessTheme.page}>
        <FluidInkDriftBackground />
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
              Please wait while we confirm your payment with Mollie...
            </p>
          </section>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <PaymentSuccess
        details={{
          id: paymentId ?? "",
          provider: "mollie",
          status: paymentStatus ?? "paid",
          orderNumber: paymentId
            ? `#ML-${paymentId.slice(-6).toUpperCase()}`
            : "—",
          totalPaid: "Paid via Mollie",
          estimatedDelivery: "7–10 business days",
          confirmationEmail: "",
        }}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // Failed/Canceled state
  if (status === "failed") {
    const reasonMessage =
      paymentStatus === "canceled"
        ? "You canceled the payment. No charges have been made."
        : paymentStatus === "expired"
          ? "Your payment session has expired. Please try again."
          : "Unfortunately, your payment could not be processed. Please try again or use a different payment method.";

    return (
      <PaymentError
        details={{
          paymentId: paymentId ?? "",
          orderNumber: paymentId
            ? `#ML-${paymentId.slice(-6).toUpperCase()}`
            : "—",
          amountDue: "—",
          attemptedOn: new Date().toLocaleString(),
          status: paymentStatus === "canceled" ? "Canceled" : "Failed",
          reasonTitle: "Payment status",
          reasonMessage,
          availableMethods: ["stripe", "paypal", "mollie"],
        }}
        onTryAgain={handleRetryPayment}
        onSelectMethod={handleRetryPayment}
      />
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div className={paymentSuccessTheme.page}>
        <FluidInkDriftBackground />
        <PageDividers />
        <div className={paymentSuccessTheme.wrapper}>
          <section
            className={paymentSuccessTheme.card}
            aria-label="Payment pending"
          >
            <div
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400 via-amber-500 to-amber-400"
              aria-hidden="true"
            />
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className={paymentSuccessTheme.title}>Payment Pending</h1>
            <p className={paymentSuccessTheme.subtitle}>
              Your payment is being processed. This may take a few moments. You
              will receive an email confirmation once your payment is complete.
            </p>
            <div className={paymentSuccessTheme.ctaStack}>
              <Button
                onClick={handleViewOrders}
                className={paymentSuccessTheme.primaryBtn}
              >
                View Orders
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateAnother}
                className={paymentSuccessTheme.secondaryBtn}
              >
                Go to Dashboard
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className={paymentErrorTheme.page}>
      <FluidInkDriftBackground />
      <PageDividers />
      <div className={paymentErrorTheme.wrapper}>
        <section className={paymentErrorTheme.card} aria-label="Error">
          <div className={paymentErrorTheme.topAccent} aria-hidden="true" />
          <div className={paymentErrorTheme.iconWrapper} aria-hidden="true">
            <AlertCircle className={paymentErrorTheme.icon} />
          </div>
          <h1 className={paymentErrorTheme.title}>Something Went Wrong</h1>
          <p className={paymentErrorTheme.subtitle}>
            {errorMessage ||
              "We couldn't verify your payment status. Please contact support if you believe your payment was successful."}
          </p>
          <div className={paymentErrorTheme.ctaStack}>
            <Button
              onClick={handleRetryPayment}
              className={paymentErrorTheme.primaryBtn}
            >
              Return to Checkout
            </Button>
            <Button
              asChild
              variant="outline"
              className={paymentErrorTheme.secondaryBtn}
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
