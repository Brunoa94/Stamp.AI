"use client";

import {
  PaymentSuccess,
  PaymentError,
  CheckoutLoading,
  CheckoutError,
} from "./components";
import { CheckoutMobileAccordion } from "./components/CheckoutMobileAccordion";
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

  if (isLoading) return <CheckoutLoading />;
  if (error) return <CheckoutError error={error} />;

  if (paymentStatus === "success") {
    return (
      <PaymentSuccess message={message} onCreateAnother={handleCreateAnother} />
    );
  }

  if (paymentStatus === "error") {
    return <PaymentError message={message} onTryAgain={handleTryAgain} />;
  }

  return (
    <div className={checkoutTheme.page.container}>
      <FluidInkDriftBackground />
      <PageDividers />

      <main className={checkoutTheme.page.mainContent}>
        <CheckoutHeaderSection />

        {/* Mobile: Dynamic Accordion Flow */}
        <div className="lg:hidden">
          <CheckoutMobileAccordion />
        </div>

        {/* Desktop: Two-column grid */}
        <div className={`hidden lg:flex ${checkoutTheme.page.grid}`}>
          <section className={checkoutTheme.page.formsColumn}>
            <ShippingSection />
            <PaymentSection />
          </section>
          <aside className={checkoutTheme.page.summaryColumn}>
            <OrderSummarySection />
          </aside>
        </div>
      </main>
    </div>
  );
}
