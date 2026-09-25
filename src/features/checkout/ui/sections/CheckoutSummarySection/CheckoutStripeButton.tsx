/**
 * CheckoutStripeButton
 *
 * Stripe payment submission button restyled to the luxury system. Reuses the
 * shared usePaymentForm hook for all payment processing; only the button
 * presentation and success redirect differ from the original.
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { usePaymentForm } from "@/features/checkout/ui/PaymentForm/usePaymentForm";
import type { ShippingAddressT } from "@/shared/schemas/checkout";
import type { PrintifyLineItem } from "@/shared/types/printifyOrder";
import type { StripePaymentIntentResultT } from "../../../lib/types/payment";
import { AnalyticsService } from "@/shared/services/analyticsService";
import { mapPurchaseEvent } from "@/features/analytics/mappers/ecommerceMappers";
import type { CartWithItems } from "@/shared/types/cart";
import { CheckoutDataBuilder } from "@/features/checkout/lib/services/checkoutDataBuilder";

interface CheckoutStripeButtonPropsI {
  amount: number;
  cart: CartWithItems;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  billingAddress: ShippingAddressT;
  cartId?: string;
  promoCode?: string;
  testMode?: boolean;
  selectedTestMethod?: string;
  disabled?: boolean;
}

export function CheckoutStripeButton({
  amount,
  cart,
  lineItems,
  shippingAddress,
  billingAddress,
  cartId,
  promoCode,
  testMode = false,
  selectedTestMethod = "visa",
  disabled = false,
}: CheckoutStripeButtonPropsI) {
  const t = useTranslations("checkout.stripeButton");
  const router = useRouter();
  const cartSnapshot = useRef<CartWithItems | null>(null);

  const handleSuccess = useCallback(
    (
      paymentIntent: StripePaymentIntentResultT,
      processedLineItems: PrintifyLineItem[],
    ) => {
      const checkoutData = {
        paymentIntentId: paymentIntent.id,
        amount,
        lineItems: processedLineItems,
        shippingAddress,
        billing: billingAddress,
        cartId: cartId || null,
        cartSnapshot:
          cartSnapshot.current ?? CheckoutDataBuilder.createCartSnapshot(cart),
        timestamp: Date.now(),
      };
      localStorage.setItem(
        "stripe_checkout_data",
        JSON.stringify(checkoutData),
      );

      AnalyticsService.track(
        "purchase",
        mapPurchaseEvent({
          transactionId: paymentIntent.id,
          lineItems: processedLineItems,
          amount,
        }),
      );

      const params = new URLSearchParams({
        payment_intent: paymentIntent.id,
        payment_intent_client_secret: paymentIntent.client_secret || "",
      });
      router.push(`/checkout/stripe-return?${params.toString()}`);
    },
    [router, amount, shippingAddress, billingAddress, cartId, cart],
  );

  const { loading, error, handleSubmit, setSelectedTestMethod } =
    usePaymentForm({
      amount,
      lineItems,
      shippingAddress,
      promoCode,
      testMode,
      onSuccess: handleSuccess,
    });

  const handlePaymentSubmit = (event: React.FormEvent) => {
    // Freeze the cart immediately before payment creation. It must survive a
    // possible 3DS redirect and must not follow later live-cart changes.
    cartSnapshot.current = CheckoutDataBuilder.createCartSnapshot(cart);
    return handleSubmit(event);
  };

  useEffect(() => {
    if (testMode && selectedTestMethod) {
      setSelectedTestMethod(selectedTestMethod);
    }
  }, [testMode, selectedTestMethod, setSelectedTestMethod]);

  return (
    <>
      <Button
        type="button"
        onClick={(event) =>
          handlePaymentSubmit(event as unknown as React.FormEvent)
        }
        disabled={disabled || loading}
        variant="primary"
        className="w-full"
      >
        {loading
          ? t("processing")
          : t("pay", { amount: (amount / 100).toFixed(2) })}
      </Button>

      {error && (
        <Paragraph
          unstyled
          role="alert"
          className="mt-4 border border-(--color-stamp-error)/20 bg-(--color-stamp-error)/5 px-4 py-3 text-lg font-bold uppercase tracking-[0.15em] text-(--color-stamp-error)"
        >
          {error}
        </Paragraph>
      )}
    </>
  );
}
