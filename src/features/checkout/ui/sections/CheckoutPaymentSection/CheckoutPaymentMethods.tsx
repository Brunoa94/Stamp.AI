/**
 * CheckoutPaymentMethods
 *
 * Payment-method radio group: one rounded-xl option card per method with a
 * radio mark, its name and the full-colour logos of the brands it accepts.
 * The selected card gets a chocolate border on cream. Selection state lives
 * in the checkout form context.
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
              "flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition-colors duration-200 sm:px-5",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate)",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "border-(--color-stamp-chocolate) bg-(--color-stamp-cream)"
                : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-chocolate)/30 hover:bg-(--color-stamp-cream)",
            )}
          >
            <Span
              unstyled
              aria-hidden="true"
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                isSelected ? "border-(--color-stamp-chocolate)" : "border-(--color-stamp-taupe)/50",
              )}
            >
              {isSelected && <Span unstyled className="h-2.5 w-2.5 rounded-full bg-(--color-stamp-gold)" />}
            </Span>
            <Span unstyled className="flex min-w-0 flex-1 flex-col gap-0.5">
              <Span variant="value" className="text-(--color-stamp-chocolate)">
                {tMethods(`${method.id}.label`)}
              </Span>
              <Span variant="micro" className="text-(--color-stamp-taupe)">
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
