/**
 * CheckoutPayPalButton
 *
 * PayPal payment button restyled to the luxury brutalist system (chocolate →
 * gold, matching the Stripe pay button) instead of PayPal blue. Reuses the
 * shared usePreparePayPalPayment mutation and the checkout form context, so
 * the PayPal order-preparation logic is not duplicated.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { FaPaypal } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/shared/constants/payment";
import { usePreparePayPalPayment } from "@/features/checkout/lib/queries/paymentQueries";
import { usePersistGuestCart } from "@/features/checkout/lib/hooks/usePersistGuestCart";
import { isLocalCart } from "@/shared/mappers/localCartMapper";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import type { CartWithItems } from "@/shared/types/cart";

interface CheckoutPayPalButtonPropsI {
  cart: CartWithItems;
  cartId: string | null;
  amount: number;
  shippingCostCents: number;
  discountCents: number;
  /** Applied promo code, re-validated by the payment function. */
  promoCode?: string;
  disabled?: boolean;
}

export function CheckoutPayPalButton({
  cart,
  cartId,
  amount,
  shippingCostCents,
  discountCents,
  promoCode,
  disabled = false,
}: CheckoutPayPalButtonPropsI) {
  const t = useTranslations("checkout.paypalButton");
  const { getValues } = useFormContext<CheckoutFormData>();
  const { mutateAsync: preparePayPal, isPending } = usePreparePayPalPayment();
  const { persistGuestCart } = usePersistGuestCart();
  const [isPreparingCart, setIsPreparingCart] = useState(false);
  const isBusy = isPending || isPreparingCart;

  const handleClick = async () => {
    if (disabled || isBusy) return;
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
      const { approvalUrl } = await preparePayPal({
        formData,
        cart: paymentCart,
        cartId: isLocalCart(cart) ? paymentCart.id : cartId,
        amount,
        shippingCostCents,
        discountCents,
        promoCode,
      });
      window.location.href = approvalUrl;
    } catch (error) {
      // Error surfaced via the mutation's (or the guest cart save's) shared error handler.
      console.error("PayPal checkout error:", error);
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
        <FaPaypal className="h-4 w-4" />
      )}
      {isBusy
        ? t("redirecting")
        : PAYMENT_CONFIRM_METHOD_UI.paypal.labelDesktop}
    </Button>
  );
}
