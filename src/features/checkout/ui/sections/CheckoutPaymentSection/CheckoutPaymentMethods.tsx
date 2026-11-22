/**
 * CheckoutPaymentMethods
 *
 * Payment-method radio group restyled to the luxury brutalist system: one
 * row per method with a radio mark, its name and the full-colour logos of
 * the brands it accepts. Selection state lives in the checkout form context.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CHECKOUT_PAYMENT_METHODS } from "@/shared/constants/payment";
import { PAYMENT_METHOD_LOGOS } from "@/shared/constants/paymentLogos";
import { PaymentLogo } from "@/features/ui/trust/PaymentLogo";
import type { PaymentMethodT } from "@/shared/types/payment";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";

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
  const tMethods = useTranslations("paymentMethods");
  return (
    <div
      role="radiogroup"
      aria-label={t("selectMethodAria")}
      className="flex flex-col gap-3"
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
              "flex w-full items-center gap-4 border px-4 py-4 text-left transition-all duration-300 sm:px-5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-(--color-stamp-gold) bg-(--color-stamp-cream)/50"
                : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-chocolate)",
            )}
          >
            <Span
              unstyled
              aria-hidden="true"
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                isSelected ? "border-(--color-stamp-gold)" : "border-(--color-stamp-divider)",
              )}
            >
              {isSelected && <Span unstyled className="h-2.5 w-2.5 rounded-full bg-(--color-stamp-gold)" />}
            </Span>
            <Span unstyled className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Span unstyled className="text-[11px] font-bold uppercase tracking-ultra text-(--color-stamp-chocolate)">
                {tMethods(`${method.id}.label`)}
              </Span>
              <Span unstyled className="text-2xs uppercase tracking-[0.15em] text-(--color-stamp-taupe)">
                {tMethods(`${method.id}.description`)}
              </Span>
            </Span>
            {/* The description already names the brands for screen readers */}
            <Span unstyled aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
              {PAYMENT_METHOD_LOGOS[method.id].map((logoId) => (
                <PaymentLogo key={logoId} id={logoId} />
              ))}
            </Span>
          </Button>
        );
      })}
    </div>
  );
}
