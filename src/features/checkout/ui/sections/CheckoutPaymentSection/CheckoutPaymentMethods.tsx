/**
 * CheckoutPaymentMethods
 *
 * Payment-method radio group restyled to the luxury brutalist system.
 * Reuses the shared PAYMENT_METHODS constant; selection state lives in the
 * checkout form context.
 */

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAYMENT_ICONS } from "@/features/homepage/lib/constants/paymentIcons";
import type { PaymentMethodT } from "@/types/payment";

// Filter payment icons by method type (iDEAL excluded - separate option coming soon)
const CARD_ICONS = PAYMENT_ICONS.filter((icon) =>
  ["visa", "mastercard", "amex"].includes(icon.id)
);
const PAYPAL_ICON = PAYMENT_ICONS.find((icon) => icon.id === "paypal");
const IDEAL_ICON = PAYMENT_ICONS.find((icon) => icon.id === "ideal");

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
      {/* Credit Card Option */}
      <button
        type="button"
        role="radio"
        aria-checked={selectedMethod === "stripe"}
        disabled={disabled}
        onClick={() => onMethodChange("stripe")}
        className={cn(
          "flex flex-1 items-center gap-3 border p-5 text-left transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selectedMethod === "stripe"
            ? "border-(--color-stamp-gold) bg-(--color-stamp-cream)/50"
            : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-chocolate)"
        )}
      >
        <span className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)">
            Credit Card
          </span>
          {/* Payment provider icons */}
          <span className="flex items-center gap-2">
            {CARD_ICONS.map((icon) => (
              <span
                key={icon.id}
                className={cn(
                  "shrink-0",
                  icon.id !== "visa" && "[&_img]:h-10! [&_img]:w-auto!"
                )}
              >
                {icon.icon}
              </span>
            ))}
          </span>
        </span>
        {selectedMethod === "stripe" && (
          <span
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-(--color-stamp-gold) text-(--color-stamp-white)"
            aria-hidden="true"
          >
            <Check className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* PayPal Option */}
      {PAYPAL_ICON && (
        <button
          type="button"
          role="radio"
          aria-checked={selectedMethod === "paypal"}
          disabled={disabled}
          onClick={() => onMethodChange("paypal")}
          className={cn(
            "flex flex-1 items-center gap-3 border p-5 text-left transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold) focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectedMethod === "paypal"
              ? "border-(--color-stamp-gold) bg-(--color-stamp-cream)/50"
              : "border-(--color-stamp-divider) bg-(--color-stamp-white) hover:border-(--color-stamp-chocolate)"
          )}
        >
          <span className="shrink-0 [&_img]:h-10! [&_img]:w-auto!">
            {PAYPAL_ICON.icon}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)">
            PayPal
          </span>
          {selectedMethod === "paypal" && (
            <span
              className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-(--color-stamp-gold) text-(--color-stamp-white)"
              aria-hidden="true"
            >
              <Check className="h-3 w-3" />
            </span>
          )}
        </button>
      )}

      {/* iDEAL - Coming Soon */}
      {IDEAL_ICON && (
        <div
          className={cn(
            "flex flex-1 items-center gap-3 border p-5 text-left",
            "border-(--color-stamp-divider) bg-(--color-stamp-white)/50 opacity-60 cursor-not-allowed"
          )}
        >
          <span className="shrink-0 [&_img]:h-10! [&_img]:w-auto!">
            {IDEAL_ICON.icon}
          </span>
          <span className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-stamp-chocolate)">
              iDEAL
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-(--color-stamp-taupe)">
              {t("comingSoon")}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
