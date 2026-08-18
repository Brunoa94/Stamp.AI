/**
 * CheckoutSummarySection
 *
 * Sticky order-summary sidebar: cart items, promo code, price breakdown, and
 * the payment action for the selected method. Reuses useCheckoutPricing,
 * buildPrintifyLineItems and the shared PayPal button; the Stripe button is
 * the restyled variant (same underlying payment hook).
 */


import { useFormContext } from "react-hook-form";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Heading } from "@/features/ui/heading";
import { useCheckoutPricing } from "@/features/checkout/lib/hooks/useCheckoutPricing";
import { buildPrintifyLineItems } from "@/features/checkout/lib/mappers/printifyLineItemsMapper";
import { CheckoutCartItems } from "./CheckoutCartItems";
import { CheckoutPromoCode } from "./CheckoutPromoCode";
import { CheckoutPriceBreakdown } from "./CheckoutPriceBreakdown";
import { CheckoutStripeButton } from "./CheckoutStripeButton";
import { CheckoutPayPalButton } from "./CheckoutPayPalButton";
import { VerifiedSecureBadge } from "@/features/ui/trust/VerifiedSecureBadge";
import type { CartWithItems } from "@/types/cart";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

interface CheckoutSummarySectionPropsI {
  cart: CartWithItems;
  cartId?: string;
  testMode?: boolean;
  selectedTestMethod?: string;
}

export function CheckoutSummarySection({
  cart,
  cartId,
  testMode = false,
  selectedTestMethod = "visa",
}: CheckoutSummarySectionPropsI) {
  const { watch, formState } = useFormContext<CheckoutFormData>();
  const paymentMethod = watch("paymentMethod");
  const billingAddress = watch("billing");
  const shippingAddress = watch("shipping");
  const useShippingAddress = watch("useShippingAddress");
  const isFormValid = formState.isValid;

  const {
    subtotal,
    shipping,
    discount,
    total,
    totalInCents,
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
    <div className="sticky top-32 border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 lg:p-10">
      <Heading
        as="h2"
        unstyled
        className="mb-8 font-heading text-2xl md:text-3xl font-bold uppercase tracking-tight"
      >
        Order <span className="text-(--color-stamp-gold)">Summary</span>
      </Heading>

      <div className="space-y-6">
        <CheckoutCartItems items={cart.cart_items} />

        <div className="h-px bg-(--color-stamp-divider)" />

        <CheckoutPromoCode
          onApply={applyPromoCode}
          onClear={clearPromoCode}
          appliedCode={appliedPromo?.isValid ? watch("promoCode") : undefined}
          error={promoError}
          isApplying={isApplyingPromo}
        />

        <div className="h-px bg-(--color-stamp-divider)" />

        <CheckoutPriceBreakdown
          subtotal={subtotal}
          shipping={shipping}
          discount={discount}
          total={total}
        />

        {paymentMethod === "stripe" && paymentShippingAddress && (
          <Elements stripe={stripePromise}>
            <CheckoutStripeButton
              amount={totalInCents}
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
          <CheckoutPayPalButton
            cart={cart}
            cartId={cartId ?? null}
            amount={totalInCents}
            disabled={disablePayment}
          />
        )}

        {/* Security verification badge */}
        <VerifiedSecureBadge variant="compact" className="mt-4" />
      </div>
    </div>
  );
}
