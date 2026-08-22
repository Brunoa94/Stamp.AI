/**
 * CheckoutPayPalButton
 *
 * PayPal payment button restyled to the luxury brutalist system (chocolate →
 * gold, matching the Stripe pay button) instead of PayPal blue. Reuses the
 * shared usePreparePayPalPayment mutation and the checkout form context, so
 * the PayPal order-preparation logic is not duplicated.
 */

"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { FaPaypal } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";
import { usePreparePayPalPayment } from "@/features/checkout/lib/queries/paymentQueries";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";

interface CheckoutPayPalButtonPropsI {
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
  disabled?: boolean;
}

export function CheckoutPayPalButton({
  cart,
  cartId,
  amount,
  disabled = false,
}: CheckoutPayPalButtonPropsI) {
  const t = useTranslations("checkout.paypalButton");
  const { getValues } = useFormContext<CheckoutFormData>();
  const { mutateAsync: preparePayPal, isPending } = usePreparePayPalPayment();

  const handleClick = async () => {
    if (disabled || isPending) return;
    try {
      const formData = getValues();
      const { approvalUrl } = await preparePayPal({
        formData,
        cart,
        cartId,
        amount,
      });
      window.location.href = approvalUrl;
    } catch (error) {
      // Error surfaced via the mutation's shared error handler.
      console.error("PayPal checkout error:", error);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isPending}
      variant="primary"
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FaPaypal className="h-4 w-4" />
      )}
      {isPending
        ? t("redirecting")
        : PAYMENT_CONFIRM_METHOD_UI.paypal.labelDesktop}
    </Button>
  );
}
