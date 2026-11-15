/**
 * CheckoutPaymentMethods
 *
 * Payment-method radio group restyled to the luxury brutalist system.
 * Reuses the shared PAYMENT_METHODS constant and shows each option's
 * full-colour brand logos; selection state lives in the checkout form context.
 */

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECKOUT_PAYMENT_METHODS } from "@/shared/constants/payment";
import { PAYMENT_METHOD_LOGOS } from "@/shared/constants/paymentLogos";
import type { PaymentMethodT } from "@/shared/types/payment";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { PaymentLogo } from "@/features/ui/trust/PaymentLogo";

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
      {CHECKOUT_PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <Button
            variant="unstyled"
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onMethodChange(method.id)}
            className={cn(
              "flex flex-1 flex-col items-start gap-4 border-2 p-5 text-left transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-(--color-stamp-gold) bg-(--color-stamp-cream)/50 shadow-(--shadow-stamp-card)"
                : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-chocolate)",
            )}
          >
            <Span unstyled className="flex w-full items-start justify-between gap-3">
              <Span unstyled className="flex flex-wrap items-center gap-1.5">
                {PAYMENT_METHOD_LOGOS[method.id].map((logo) => (
                  <PaymentLogo key={logo.id} logo={logo} decorative />
                ))}
              </Span>
              <Span
                unstyled
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                  isSelected
                    ? "border-(--color-stamp-gold) bg-(--color-stamp-gold) text-(--color-stamp-white)"
                    : "border-(--color-stamp-divider) bg-(--color-stamp-white)",
                )}
                aria-hidden="true"
              >
                {isSelected && <Check className="h-3 w-3" />}
              </Span>
            </Span>
            <Span unstyled className="flex flex-col gap-1">
              <Span unstyled className="text-xs font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)">
                {method.label}
              </Span>
              <Span unstyled className="text-xs tracking-wide text-(--color-stamp-taupe)">
                {method.description}
              </Span>
            </Span>
          </Button>
        );
      })}
    </div>
  );
}
