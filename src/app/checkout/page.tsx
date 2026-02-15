"use client";

import { useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import {
  PaymentSuccess,
  PaymentError,
  CheckoutLoading,
  CheckoutError,
} from "@/features/checkout/components";
import {
  CheckoutSubscriberProvider,
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import {
  CheckoutHeaderSection,
  ShippingSection,
  PaymentSection,
  OrderSummarySection,
} from "@/features/checkout/sections";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";

function CheckoutContent() {
  const isLoading = CheckoutSelectors.isLoading();
  const error = CheckoutSelectors.error();
  const paymentStatus = CheckoutSelectors.paymentStatus();
  const message = CheckoutSelectors.message();

  const { handleCreateAnother, handleTryAgain } = useCheckoutSubscriberActions();

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
    <div className={clsx(componentThemes.container.page, "py-8")}>
      <div className="max-w-6xl mx-auto px-4">
        <CheckoutHeaderSection />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            <ShippingSection />
            <PaymentSection />
          </div>

          {/* Right Column: Order Summary */}
          <OrderSummarySection />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const cartId = searchParams.get("cartId");

  return (
    <ProtectedRoute fallback={<CheckoutLoading />}>
      <CheckoutSubscriberProvider orderId={orderId} cartId={cartId}>
        <CheckoutContent />
      </CheckoutSubscriberProvider>
    </ProtectedRoute>
  );
}
