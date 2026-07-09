/**
 * CheckoutV2Content
 *
 * Container for the luxury brutalist checkout page. Resolves the cart, wires
 * the shared CheckoutFormProvider, and owns the (styled) test-mode state.
 * All business logic — pricing, payment, form validation — is reused from
 * the existing checkout feature.
 */

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartById } from "@/queries/cartQueries";
import { CheckoutFormProvider } from "@/features/checkout/lib/context/CheckoutFormContext";
import { CheckoutV2Layout } from "./components/CheckoutV2Layout";
import { CheckoutV2Header } from "./components/CheckoutV2Header";
import { CheckoutV2TestModeToggle } from "./components/CheckoutV2TestModeToggle";
import { CheckoutV2LoadingSection } from "./sections/CheckoutV2LoadingSection";
import { CheckoutV2NotFoundSection } from "./sections/CheckoutV2NotFoundSection";
import { CheckoutV2BillingSection } from "./sections/CheckoutV2BillingSection";
import { CheckoutV2ShippingToggle } from "./sections/CheckoutV2ShippingToggle";
import { CheckoutV2ShippingSection } from "./sections/CheckoutV2ShippingSection";
import { CheckoutV2PaymentSection } from "./sections/CheckoutV2PaymentSection/CheckoutV2PaymentSection";
import { CheckoutV2SummarySection } from "./sections/CheckoutV2SummarySection/CheckoutV2SummarySection";
import type { CartWithItems } from "@/types/cart";

export function CheckoutV2Content() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");

  const { data: cart, isLoading, error } = useCartById(cartId || "");

  if (isLoading) {
    return <CheckoutV2LoadingSection />;
  }

  if (error || !cart) {
    return <CheckoutV2NotFoundSection />;
  }

  return (
    <CheckoutFormProvider cartId={cartId}>
      <CheckoutV2Form cart={cart} />
    </CheckoutFormProvider>
  );
}

function CheckoutV2Form({ cart }: { cart: CartWithItems }) {
  const [testMode, setTestMode] = useState(false);
  const [selectedTestMethod, setSelectedTestMethod] = useState("visa");

  return (
    <CheckoutV2Layout
      header={<CheckoutV2Header />}
      forms={
        <>
          <CheckoutV2TestModeToggle
            testMode={testMode}
            onTestModeChange={setTestMode}
          />
          <CheckoutV2BillingSection />
          <CheckoutV2ShippingToggle />
          <CheckoutV2ShippingSection />
          <CheckoutV2PaymentSection
            testMode={testMode}
            selectedTestMethod={selectedTestMethod}
            onTestMethodChange={setSelectedTestMethod}
          />
        </>
      }
      summary={
        <CheckoutV2SummarySection
          cart={cart}
          cartId={cart.id}
          testMode={testMode}
          selectedTestMethod={selectedTestMethod}
        />
      }
    />
  );
}
