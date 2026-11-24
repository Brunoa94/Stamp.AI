"use client";

import { useTranslations } from "next-intl";
import { CREDIT_PAYMENT_METHODS, type PaymentMethodId } from "@/shared/constants/payment";
import { PaymentMethodButton } from "./PaymentMethodButton";

interface PaymentMethodSelectorProps {
  selected: PaymentMethodId;
  onSelect: (method: PaymentMethodId) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selected,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("buyCredits.payment");

  return (
    <div
      role="radiogroup"
      aria-label={t("methodSelectorLabel")}
      className="flex gap-3 mb-6"
    >
      {CREDIT_PAYMENT_METHODS.map((method) => (
        <PaymentMethodButton
          key={method.id}
          method={method}
          isSelected={selected === method.id}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
