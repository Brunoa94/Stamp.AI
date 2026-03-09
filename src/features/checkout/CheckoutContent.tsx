"use client";

import {
  PaymentSuccess,
  PaymentError,
  CheckoutLoading,
  CheckoutError,
} from "./components";
import { CheckoutSelectors, useCheckoutSubscriberActions } from "./context";

import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";
import { PageDividers } from "@/features/ui/page-dividers";
import { CheckoutHeaderSection } from "./sections/CheckoutHeaderSection";
import { ShippingSection } from "./sections/ShippingSection";
import { PaymentSection } from "./sections/PaymentSection";
import { OrderSummarySection } from "./sections/OrderSummarySection";
import { checkoutTheme } from "@/theme";

export function CheckoutContent() {
  const isLoading = CheckoutSelectors.isLoading();
  const error = CheckoutSelectors.error();
  const paymentStatus = CheckoutSelectors.paymentStatus();
  const message = CheckoutSelectors.message();

  const { handleCreateAnother, handleTryAgain } =
    useCheckoutSubscriberActions();

  // Loading state
  if (isLoading) {
    return <CheckoutLoading />;
  }

  // Error state
  if (error) {
    return <CheckoutError error={error} />;
  }

  // Payment success state
  if (paymentStatus === "success") {
    return (
      <PaymentSuccess message={message} onCreateAnother={handleCreateAnother} />
    );
  }

  // Payment error state
  if (paymentStatus === "error") {
    return <PaymentError message={message} onTryAgain={handleTryAgain} />;
  }

  // Main checkout form
  return (
    <div className={checkoutTheme.page.container}>
      {/* Background decoration */}
      <FluidInkDriftBackground />

      {/* Side dividers */}
      <PageDividers />

      <main className={checkoutTheme.page.mainContent}>
        <CheckoutHeaderSection />

        <div className={checkoutTheme.page.grid}>
          {/* Left Column: Forms */}
          <section className={checkoutTheme.page.formsColumn}>
            <ShippingSection />
            <PaymentSection />
          </section>

          {/* Right Column: Order Summary */}
          <aside className={checkoutTheme.page.summaryColumn}>
            <OrderSummarySection />
          </aside>
        </div>
      </main>
    </div>
  );
}
