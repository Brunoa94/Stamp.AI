/**
 * CheckoutV2SummarySection
 *
 * Sticky order-summary sidebar: cart items, promo code, price breakdown, and
 * the payment action for the selected method. Reuses useCheckoutPricing,
 * buildPrintifyLineItems and the shared PayPal button; the Stripe button is
 * the restyled v2 variant (same underlying payment hook).
 */

"use client";

import { useFormContext } from "react-hook-form";
import { Elements } from "@stripe/react-stripe-js";
import { ShieldCheck } from "lucide-react";
import { stripePromise } from "@/lib/stripe";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useCheckoutPricing } from "@/features/checkout/lib/hooks/useCheckoutPricing";
import { buildPrintifyLineItems } from "@/features/checkout/lib/mappers/printifyLineItemsMapper";
import { CustomPayPalButton } from "@/features/checkout/ui/PayPalButton/CustomPayPalButton";
import { CheckoutV2CartItems } from "./CheckoutV2CartItems";
import { CheckoutV2PromoCode } from "./CheckoutV2PromoCode";
import { CheckoutV2PriceBreakdown } from "./CheckoutV2PriceBreakdown";
import { CheckoutV2StripeButton } from "./CheckoutV2StripeButton";
import type { CartWithItems } from "@/types/cart";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

interface CheckoutV2SummarySectionPropsI {
  cart: CartWithItems;
  cartId?: string;
  testMode?: boolean;
  selectedTestMethod?: string;
}

export function CheckoutV2SummarySection({
  cart,
  cartId,
  testMode = false,
  selectedTestMethod = "visa",
}: CheckoutV2SummarySectionPropsI) {
  const { watch, formState } = useFormContext<CheckoutFormData>();
  const paymentMethod = watch("paymentMethod");
  const billingAddress = watch("billing");
  const shippingAddress = watch("shipping");
  const useShippingAddress = watch("useShippingAddress");
  const isFormValid = formState.isValid;

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

  const paymentShippingAddress =
    useShippingAddress && shippingAddress ? shippingAddress : billingAddress;
  const lineItems = buildPrintifyLineItems(cart.cart_items);
  const disablePayment = !isFormValid || total <= 0;

  return (
    <div className="sticky top-8 border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 lg:p-10">
      <Heading as="h2" variant="card" className="mb-8">
        Order <span className="text-(--color-stamp-gold)">Summary</span>
      </Heading>

      <div className="space-y-6">
        <CheckoutV2CartItems items={cart.cart_items} />

        <div className="h-px bg-(--color-stamp-divider)" />

        <CheckoutV2PromoCode
          onApply={applyPromoCode}
          onClear={clearPromoCode}
          appliedCode={appliedPromo?.isValid ? watch("promoCode") : undefined}
          error={promoError}
          isApplying={isApplyingPromo}
        />

        <div className="h-px bg-(--color-stamp-divider)" />

        <CheckoutV2PriceBreakdown
          subtotal={subtotal}
          shipping={0}
          discount={discount}
          total={total}
        />

        {paymentMethod === "stripe" && paymentShippingAddress && (
          <Elements stripe={stripePromise}>
            <CheckoutV2StripeButton
              amount={total}
              lineItems={lineItems}
              shippingAddress={paymentShippingAddress}
              cartId={cartId}
              testMode={testMode}
              selectedTestMethod={selectedTestMethod}
              disabled={disablePayment}
            />
          </Elements>
        )}

        {paymentMethod === "paypal" && paymentShippingAddress && (
          <CustomPayPalButton
            cart={cart}
            cartId={cartId ?? null}
            amount={total}
            disabled={disablePayment}
          />
        )}

        <div className="flex items-center justify-center gap-2 text-(--color-stamp-taupe)">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <Span variant="micro">Secure encrypted transactions</Span>
        </div>
      </div>
    </div>
  );
}
