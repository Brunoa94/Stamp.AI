/**
 * CheckoutIdealButton
 *
 * iDEAL payment button (via Mollie) styled to match the Stripe and PayPal pay
 * buttons. Reuses the shared usePrepareIdealPayment mutation and the checkout
 * form context; Mollie handles the bank selection on its hosted checkout page,
 * so this button only prepares the payment and redirects.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { Landmark, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/shared/constants/payment";
import { usePrepareIdealPayment } from "@/features/checkout/lib/queries/paymentQueries";
import { usePersistGuestCart } from "@/features/checkout/lib/hooks/usePersistGuestCart";
import { useSinglePaymentAttempt } from "@/features/checkout/lib/hooks/useSinglePaymentAttempt";
import { isLocalCart } from "@/shared/mappers/localCartMapper";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import type { CartWithItems } from "@/shared/types/cart";

interface CheckoutIdealButtonPropsI {
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
  shippingCostCents: number;
  discountCents: number;
  /** Applied promo code, re-validated by the payment function. */
  promoCode?: string;
  disabled?: boolean;
}

export function CheckoutIdealButton({
  cart,
  cartId,
  amount,
  shippingCostCents,
  discountCents,
  promoCode,
  disabled = false,
}: CheckoutIdealButtonPropsI) {
  const t = useTranslations("checkout.idealButton");
  const { getValues } = useFormContext<CheckoutFormData>();
  const { mutateAsync: prepareIdeal, isPending } = usePrepareIdealPayment();
  const { persistGuestCart } = usePersistGuestCart();
  const [isPreparingCart, setIsPreparingCart] = useState(false);
  const isBusy = isPending || isPreparingCart;
  const runPaymentAttempt = useSinglePaymentAttempt();

  const handleClick = () => {
    if (disabled || isBusy) return;
    return runPaymentAttempt(startPayment);
  };

  const startPayment = async () => {
    try {
      const formData = getValues();
      // A guest pays for a database copy of their local cart.
      let paymentCart = cart;
      if (isLocalCart(cart)) {
        setIsPreparingCart(true);
        try {
          paymentCart = await persistGuestCart();
        } finally {
          setIsPreparingCart(false);
        }
      }
      const { checkoutUrl } = await prepareIdeal({
        formData,
        cart: paymentCart,
        cartId: isLocalCart(cart) ? paymentCart.id : cartId,
        amount,
        shippingCostCents,
        discountCents,
        promoCode,
      });
      window.location.href = checkoutUrl;
    } catch (error) {
      // Error surfaced via the mutation's (or the guest cart save's) shared error handler.
      console.error("iDEAL checkout error:", error);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isBusy}
      variant="primary"
      className="w-full"
    >
      {isBusy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Landmark className="h-4 w-4" />
      )}
      {isBusy
        ? t("redirecting")
        : PAYMENT_CONFIRM_METHOD_UI.ideal.labelDesktop}
    </Button>
  );
}
