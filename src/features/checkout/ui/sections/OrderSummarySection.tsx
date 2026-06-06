"use client";

import { useFormContext } from "react-hook-form";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { SectionHeader } from "@/features/ui/section-header";
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
        className="glass-card p-8 rounded-none lg:sticky lg:top-4 space-y-6"
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
    <div className="glass-card p-8 rounded-none lg:sticky lg:top-4 space-y-6">
      <SectionHeader title="Order Summary" className="mb-0" />
      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest -mt-4">
        {cart.cart_items.length}{" "}
        {cart.cart_items.length === 1 ? "item" : "items"}
      </p>

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

      <p className="text-xs text-center text-slate-400 font-bold uppercase tracking-widest">
        {paymentMethod === "stripe" && "Secure payment with Stripe"}
        {paymentMethod === "paypal" && "You'll be redirected to PayPal"}
      </p>
    </div>
  );
}
