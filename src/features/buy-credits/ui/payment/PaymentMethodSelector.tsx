"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { cn } from "@/lib/utils";
import { checkoutTheme } from "@/theme/components";
import { PAYMENT_METHODS, type PaymentMethodId, type PaymentMethodOption } from "@/constants/payment";

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
  const theme = checkoutTheme.paymentMethodSelector;
  const t = useTranslations("buyCredits.payment");

  return (
    <div
      role="radiogroup"
      aria-label={t("methodSelectorLabel")}
      className={theme.container}
    >
      {PAYMENT_METHODS.map((method) => (
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

interface PaymentMethodButtonProps {
  method: PaymentMethodOption;
  isSelected: boolean;
  onSelect: (method: PaymentMethodId) => void;
  disabled: boolean;
}

function PaymentMethodButton({
  method,
  isSelected,
  onSelect,
  disabled,
}: PaymentMethodButtonProps) {
  const theme = checkoutTheme.paymentMethodSelector;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onSelect(method.id)}
      disabled={disabled}
      role="radio"
      aria-checked={isSelected}
      className={cn(
        theme.button,
        isSelected ? theme.buttonActive : theme.buttonInactive
      )}
    >
      <method.Icon
        className={cn(
          theme.icon,
          isSelected ? "text-[#7C3AED]" : "text-slate-400"
        )}
      />
      <div className={theme.labelWrap}>
        <Label asChild className={theme.label}>
          <span>{method.label}</span>
        </Label>
        <span className={theme.description}>{method.description}</span>
      </div>
      {isSelected && (
        <span className={theme.checkmark} aria-hidden="true">
          <Check className="w-3 h-3" />
        </span>
      )}
    </Button>
  );
}
