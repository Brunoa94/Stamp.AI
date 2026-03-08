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

// Static style constants defined outside component
const checkoutStyles = {
  container: "min-h-screen relative shadow-lg rounded-2xl pb-8",
  mainContent: "max-w-360 mx-auto px-6 md:px-16 xl:px-24 pb-16 ",
  grid: "flex flex-col lg:flex-row gap-10",
  formsColumn: "flex-1 space-y-8 lg:w-7/12",
  summaryColumn: "lg:w-5/12",
};

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
    <div className={checkoutStyles.container}>
      {/* Background decoration */}
      <FluidInkDriftBackground />

      {/* Side dividers */}
      <PageDividers />

      <main className={checkoutStyles.mainContent}>
        <CheckoutHeaderSection />

        <div className={checkoutStyles.grid}>
          {/* Left Column: Forms */}
          <section className={checkoutStyles.formsColumn}>
            <ShippingSection />
            <PaymentSection />
          </section>

          {/* Right Column: Order Summary */}
          <aside className={checkoutStyles.summaryColumn}>
            <OrderSummarySection />
          </aside>
        </div>
      </main>
    </div>
  );
}
