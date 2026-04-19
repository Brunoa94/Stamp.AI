"use client";

import {
  PaymentSuccess,
  PaymentError,
  CheckoutLoading,
  CheckoutLoadingState,
  CheckoutError,
} from "./components";
import { CheckoutSelectors, useCheckoutSubscriberActions } from "./context";

import { PageDividers } from "@/features/ui/page-dividers";
import { CheckoutHeaderSection } from "./sections/CheckoutHeaderSection";
import { ShippingSection } from "./sections/ShippingSection";
import { PaymentSection } from "./sections/PaymentSection";
import { OrderSummarySection } from "./sections/OrderSummarySection";
import { CheckoutMobileContent } from "./mobile";
import { checkoutTheme } from "@/theme";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function CheckoutContent() {
  const isLoading = CheckoutSelectors.isLoading();
  const error = CheckoutSelectors.error();
  const paymentStatus = CheckoutSelectors.paymentStatus();
  const paymentSuccessDetails = CheckoutSelectors.paymentSuccessDetails();
  const paymentErrorDetails = CheckoutSelectors.paymentErrorDetails();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const message = CheckoutSelectors.message();

  // md breakpoint matches Tailwind's default (768px).
  // Using JS here (not CSS) ensures only ONE layout is ever mounted,
  // preventing duplicate PaymentForm instances from racing to call onSuccess.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { handleCreateAnother, handleTryAgain, setPaymentMethod } =
    useCheckoutSubscriberActions();

  // Loading state
  if (isLoading) {
    return <CheckoutLoading />;
  }

  // Payment processing state (for all payment methods)
  if (isProcessingPayment) {
    return <CheckoutLoadingState message={message} />;
  }

  // Error state
  if (error) {
    return <CheckoutError error={error} />;
  }

  // Payment success state
  if (paymentStatus === "success") {
    return (
      <PaymentSuccess
        details={paymentSuccessDetails}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // Payment error state
  if (paymentStatus === "error") {
    return (
      <PaymentError
        details={paymentErrorDetails}
        onTryAgain={handleTryAgain}
        onSelectMethod={(method) => {
          if (method === "applepay") return;
          setPaymentMethod(method);
          handleTryAgain();
        }}
      />
    );
  }

  // Background decoration (fixed, shared by both layouts)
  return (
    <>
      <PageDividers />

      {isDesktop ? (
        /* ── Desktop layout (md and above) ── */
        <div className={checkoutTheme.page.container}>
          <div className={checkoutTheme.page.mainContent}>
            <CheckoutHeaderSection />

            <div className={checkoutTheme.page.grid}>
              {/* Left Column: Forms */}
              <div className={checkoutTheme.page.formsColumn}>
                <ShippingSection />
                <PaymentSection />
              </div>

              {/* Right Column: Order Summary */}
              <aside className={checkoutTheme.page.summaryColumn}>
                <OrderSummarySection />
              </aside>
            </div>
          </div>
        </div>
      ) : (
        /* ── Mobile layout (below md) ── */
        <CheckoutMobileContent />
      )}
    </>
  );
}
