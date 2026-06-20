"use client";

import { useFormContext } from "react-hook-form";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { PromoCodeInput } from "../components/PromoCodeInput";
import { CartItemsList } from "../components/CartItemsList";
import { PriceBreakdown } from "../components/PriceBreakdown";
import { CustomPayPalButton } from "../PayPalButton/CustomPayPalButton";
import { StripePaymentButton } from "../components/StripePaymentButton";
import { useCheckoutPricing } from "../../lib/hooks/useCheckoutPricing";
import { buildPrintifyLineItems } from "../../lib/mappers/printifyLineItemsMapper";
import type { CartWithItems } from "@/types/cart";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";

interface OrderSummarySectionProps {
  cart: CartWithItems | null;
  cartId?: string;
  isLoading?: boolean;
  isSubmitting?: boolean;
  testMode?: boolean;
  selectedTestMethod?: string;
}

/**
 * OrderSummarySection - Order summary sidebar with cart items, pricing, and checkout
 * Refactored to use molecules for better separation of concerns
 */
export function OrderSummarySection({
  cart,
  cartId,
  isLoading,
  isSubmitting = false,
  testMode = false,
  selectedTestMethod = "visa",
}: OrderSummarySectionProps) {
  const { watch } = useFormContext<CheckoutFormData>();
  const paymentMethod = watch("paymentMethod");
  const billingAddress = watch("billing");
  const shippingAddress = watch("shipping");
  const useShippingAddress = watch("useShippingAddress");

  const {
    subtotal,
    discount,
    total,
    appliedPromo,
    promoError,
    isApplyingPromo,
    applyPromoCode,
    clearPromoCode,
  } = useCheckoutPricing({ cart });

  if (isLoading || !cart) {
    return (
      <div
        className="bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)] lg:sticky lg:top-4 space-y-6"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-20 bg-slate-200 rounded" />
          <div className="h-20 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  // Get the appropriate shipping address for payment
  const paymentShippingAddress =
    useShippingAddress && shippingAddress ? shippingAddress : billingAddress;

  // Build line items for payment
  const lineItems = cart ? buildPrintifyLineItems(cart.cart_items) : [];

  return (
    <div className="bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)] lg:sticky lg:top-4">
      {/* Header */}
      <Heading as="h2" variant="card" className="mb-8">
        Order <span className="text-brandPurple">Summary</span>
      </Heading>

      <div className="space-y-6">
        <div className="h-px bg-slate-100" />

      <CartItemsList items={cart.cart_items} />

      <div className="h-px bg-slate-100" />

      <PromoCodeInput
        onApply={applyPromoCode}
        onClear={clearPromoCode}
        appliedCode={appliedPromo?.isValid ? watch("promoCode") : undefined}
        error={promoError}
        isApplying={isApplyingPromo}
      />

      <div className="h-px bg-slate-100" />

      <PriceBreakdown
        subtotal={subtotal}
        shipping={0}
        discount={discount}
        total={total}
      />

      {/* Payment Buttons - Conditional based on payment method */}
      {paymentMethod === "stripe" && paymentShippingAddress && (
        <Elements stripe={stripePromise}>
          <StripePaymentButton
            amount={total}
            lineItems={lineItems}
            shippingAddress={paymentShippingAddress}
            cartId={cartId}
            testMode={testMode}
            selectedTestMethod={selectedTestMethod}
            disabled={isSubmitting || total <= 0}
          />
        </Elements>
      )}

      {paymentMethod === "paypal" && paymentShippingAddress && cart && (
        <CustomPayPalButton
          cart={cart}
          cartId={cartId ?? null}
          amount={total}
          disabled={isSubmitting || total <= 0}
        />
      )}

        <Span variant="micro" className="text-center block tracking-[0.4em] opacity-30">
          {paymentMethod === "stripe" && "Secure encrypted transactions"}
          {paymentMethod === "paypal" && "Secure encrypted transactions"}
        </Span>
      </div>
    </div>
  );
}
