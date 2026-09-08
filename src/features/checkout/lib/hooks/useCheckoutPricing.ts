"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { CheckoutPromoCodeService } from "../services/promoCodeService";
import { getDiscountValue } from "../helpers/promoCodeHelpers";
import type { CartWithItems } from "@/types/cart";
import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { PromoCodeValidationResult } from "@/schemas/promocode";

/** Free shipping threshold in euros */
const FREE_SHIPPING_THRESHOLD = 60;
/** Shipping cost in euros for orders below threshold */
const SHIPPING_COST = 4.99;

interface UseCheckoutPricingParams {
  cart: CartWithItems | null;
}

export function useCheckoutPricing({ cart }: UseCheckoutPricingParams) {
  const t = useTranslations("checkout.pricing");
  const { watch } = useFormContext<CheckoutFormData>();
  const [appliedPromo, setAppliedPromo] = useState<
    PromoCodeValidationResult | null
  >(
    null,
  );
  const [promoError, setPromoError] = useState<string | null>(null);

  const promoCode = watch("promoCode");

  // Calculate subtotal from cart items (in cents)
  const subtotalInCents = (() => {
    if (!cart?.cart_items) return 0;
    return cart.cart_items.reduce((sum, item) => {
      return sum + ((item.unit_price ?? 0) * (item.quantity ?? 1));
    }, 0);
  })();

  // Convert cents to euros for display and calculations
  const subtotal = subtotalInCents / 100;

  // Discount from applied promo code (in euros)
  const discount = getDiscountValue(appliedPromo);

  // Calculate subtotal after discount for shipping calculation
  const subtotalAfterDiscount = subtotal - discount;

  // Shipping: free for orders >= €60 (after discount), otherwise €4.99
  const shipping = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  // Total = subtotal + shipping - discount (all in euros)
  const total = subtotal + shipping - discount;

  // Total in cents for payment processing
  const totalInCents = Math.round(total * 100);

  // React Query mutation for promo code validation
  const validatePromoCodeMutation = useMutation({
    mutationFn: ({ code, subtotalValue }: { code: string; subtotalValue: number }) =>
      CheckoutPromoCodeService.validateAndApply(code, subtotalValue),
    onSuccess: (result) => {
      if (result.isValid && result.appliedPromo) {
        setAppliedPromo(result);
        setPromoError(null);
      } else {
        setAppliedPromo(null);
        // result.message may be one of our own catalog keys (from
        // CheckoutPromoCodeService) or a raw backend message — translate the
        // former, pass the latter through untouched.
        setPromoError(
          result.message
            ? t.has(result.message)
              ? t(result.message)
              : result.message
            : t("invalidPromoCode")
        );
      }
    },
    onError: (error) => {
      setAppliedPromo(null);
      const errorMessage = error instanceof Error
        ? error.message
        : t("validationFailed");
      setPromoError(errorMessage);
    },
  });

  // Apply promo code
  const applyPromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoError(t("enterPromoCode"));
      return;
    }

    setPromoError(null);
    await validatePromoCodeMutation.mutateAsync({
      code: code.trim(),
      subtotalValue: subtotal,
    });
  };

  // Clear promo code
  const clearPromoCode = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  return {
    subtotal,
    shipping,
    discount,
    total,
    totalInCents,
    promoCode,
    appliedPromo,
    promoError,
    isApplyingPromo: validatePromoCodeMutation.isPending,
    applyPromoCode,
    clearPromoCode,
  };
}
