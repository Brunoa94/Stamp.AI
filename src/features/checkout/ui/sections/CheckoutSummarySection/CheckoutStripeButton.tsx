/**
 * CheckoutStripeButton
 *
 * Stripe payment submission button restyled to the luxury system. Reuses the
 * shared usePaymentForm hook for all payment processing; only the button
 * presentation and success redirect differ from the original.
 */

"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { usePaymentForm } from "@/features/checkout/ui/PaymentForm/usePaymentForm";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { StripePaymentIntentResultT } from "../../../lib/types/payment";

interface CheckoutStripeButtonPropsI {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  cartId?: string;
  testMode?: boolean;
  selectedTestMethod?: string;
  disabled?: boolean;
}

export function CheckoutStripeButton({
  amount,
  lineItems,
  shippingAddress,
  cartId,
  testMode = false,
  selectedTestMethod = "visa",
  disabled = false,
}: CheckoutStripeButtonPropsI) {
  const t = useTranslations("checkout.stripeButton");
  const router = useRouter();

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
        cartId: cartId || null,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        "stripe_checkout_data",
        JSON.stringify(checkoutData),
      );

      const params = new URLSearchParams({
        payment_intent: paymentIntent.id,
        payment_intent_client_secret: paymentIntent.client_secret || "",
      });
      router.push(`/checkout/stripe-return?${params.toString()}`);
    },
    [router, amount, shippingAddress, cartId],
  );

  const { loading, error, handleSubmit, setSelectedTestMethod } =
    usePaymentForm({
      amount,
      lineItems,
      shippingAddress,
      testMode,
      onSuccess: handleSuccess,
    });

  useEffect(() => {
    if (testMode && selectedTestMethod) {
      setSelectedTestMethod(selectedTestMethod);
    }
  }, [testMode, selectedTestMethod, setSelectedTestMethod]);

  return (
    <>
      <Button
        type="button"
        onClick={(event) => handleSubmit(event as unknown as React.FormEvent)}
        disabled={disabled || loading}
        variant="secondary-brown"
        className="w-full font-heading"
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
