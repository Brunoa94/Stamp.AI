/**
 * CheckoutIdealButton
 *
 * iDEAL payment button (via Mollie) styled to match the Stripe and PayPal pay
 * buttons. Reuses the shared usePrepareIdealPayment mutation and the checkout
 * form context; Mollie handles the bank selection on its hosted checkout page,
 * so this button only prepares the payment and redirects.
 */

"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Landmark, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";
import { usePrepareIdealPayment } from "@/features/checkout/lib/queries/paymentQueries";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import type { CartWithItems } from "@/types/cart";

interface CheckoutIdealButtonPropsI {
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
  disabled?: boolean;
}

export function CheckoutIdealButton({
  cart,
  cartId,
  amount,
  disabled = false,
}: CheckoutIdealButtonPropsI) {
  const t = useTranslations("checkout.idealButton");
  const { getValues } = useFormContext<CheckoutFormData>();
  const { mutateAsync: prepareIdeal, isPending } = usePrepareIdealPayment();

  const handleClick = async () => {
    if (disabled || isPending) return;
    try {
      const formData = getValues();
      const { checkoutUrl } = await prepareIdeal({
        formData,
        cart,
        cartId,
        amount,
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      // Error surfaced via the mutation's shared error handler.
      console.error("iDEAL checkout error:", error);
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
        <Landmark className="h-4 w-4" />
      )}
      {isPending
        ? t("redirecting")
        : PAYMENT_CONFIRM_METHOD_UI.ideal.labelDesktop}
    </Button>
  );
}
