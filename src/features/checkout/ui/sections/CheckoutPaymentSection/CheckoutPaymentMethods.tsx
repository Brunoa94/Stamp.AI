/**
 * CheckoutPaymentMethods
 *
 * Payment-method radio group restyled to the luxury brutalist system.
 * Reuses the shared PAYMENT_METHODS constant; selection state lives in the
 * checkout form context.
 */

"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/constants/payment";
import type { PaymentMethodT } from "@/types/payment";

interface CheckoutPaymentMethodsPropsI {
  selectedMethod: PaymentMethodT;
  onMethodChange: (method: PaymentMethodT) => void;
  disabled?: boolean;
}

export function CheckoutPaymentMethods({
  selectedMethod,
  onMethodChange,
  disabled = false,
}: CheckoutPaymentMethodsPropsI) {
  const t = useTranslations("checkout.payment");
  return (
    <div
      role="radiogroup"
      aria-label={t("selectMethodAria")}
      className="flex flex-col gap-4 sm:flex-row"
      data-disabled={disabled || undefined}
    >
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onMethodChange(method.id)}
            className={cn(
              "flex flex-1 items-center gap-3 border p-5 text-left transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-(--color-stamp-gold) bg-(--color-stamp-cream)/50"
                : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-chocolate)",
            )}
          >
            <method.Icon
              className={cn(
                "h-6 w-6 shrink-0",
                isSelected
                  ? "text-(--color-stamp-gold)"
                  : "text-(--color-stamp-taupe)",
              )}
              aria-hidden="true"
            />
            <span className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)">
                {method.label}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-(--color-stamp-taupe)">
                {method.description}
              </span>
            </span>
            {isSelected && (
              <span
                className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-(--color-stamp-gold) text-(--color-stamp-white)"
                aria-hidden="true"
              >
                <Check className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
