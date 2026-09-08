/**
 * CheckoutContent
 *
 * Container for the luxury brutalist checkout page. Resolves the cart, wires
 * the shared CheckoutFormProvider, and owns the (styled) test-mode state.
 * All business logic — pricing, payment, form validation — is reused from
 * the existing checkout feature.
 */

"use client";

import { useState } from "react";
import { CheckoutFormProvider } from "@/features/checkout/lib/context/CheckoutFormContext";
import { useCheckoutCart } from "../lib/hooks/useCheckoutCart";
import { CheckoutLayout } from "./components/CheckoutLayout";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CheckoutTestModeToggle } from "./components/CheckoutTestModeToggle";
import { CheckoutLoadingSection } from "./sections/CheckoutLoadingSection";
import { CheckoutNotFoundSection } from "./sections/CheckoutNotFoundSection";
import { CheckoutBillingSection } from "./sections/CheckoutBillingSection";
import { CheckoutShippingToggle } from "./sections/CheckoutShippingToggle";
import { CheckoutShippingSection } from "./sections/CheckoutShippingSection";
import { CheckoutPaymentSection } from "./sections/CheckoutPaymentSection/CheckoutPaymentSection";
import { CheckoutSummarySection } from "./sections/CheckoutSummarySection/CheckoutSummarySection";
import type { CartWithItems } from "@/types/cart";

export function CheckoutContent() {
  const { cartId, cart, isLoading, error } = useCheckoutCart();

  if (isLoading) {
    return <CheckoutLoadingSection />;
  }

  if (error || !cart) {
    return <CheckoutNotFoundSection />;
  }

  return (
    <CheckoutFormProvider cartId={cartId}>
      <CheckoutForm cart={cart} />
    </CheckoutFormProvider>
  );
}

function CheckoutForm({ cart }: { cart: CartWithItems }) {
  const [testMode, setTestMode] = useState(false);
  const [selectedTestMethod, setSelectedTestMethod] = useState("visa");

  return (
    <CheckoutLayout
      header={<CheckoutHeader />}
      forms={
        <>
          <CheckoutTestModeToggle
            testMode={testMode}
            onTestModeChange={setTestMode}
          />
          <CheckoutBillingSection />
          <CheckoutShippingToggle />
          <CheckoutShippingSection />
          <CheckoutPaymentSection
            testMode={testMode}
            selectedTestMethod={selectedTestMethod}
            onTestMethodChange={setSelectedTestMethod}
          />
        </>
      }
      summary={
        <CheckoutSummarySection
          cart={cart}
          cartId={cart.id}
          testMode={testMode}
          selectedTestMethod={selectedTestMethod}
        />
      }
    />
  );
}
