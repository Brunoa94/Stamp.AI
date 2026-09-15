"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { CheckoutPromoCodeService } from "../services/promoCodeService";
import { computeCheckoutTotals } from "../helpers/checkoutTotals";
import type { CartWithItems } from "@/types/cart";
import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { PromoCodeValidationResult } from "@/schemas/promocode";

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

  // Money rows in euros (totalInCents for payment processing), with the
  // applied promo folded in — including fixed_total codes like
  // REDUCE_TOTAL that set the final all-inclusive total.
  const { subtotal, shipping, discount, total, totalInCents } =
    computeCheckoutTotals(subtotalInCents, appliedPromo);

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
