"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { CREDIT_PAYMENT_METHODS, type PaymentMethodId, type PaymentMethodOption } from "@/shared/constants/payment";

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
  return (
    <Button
      type="button"
      variant="option-card"
      onClick={() => onSelect(method.id)}
      disabled={disabled}
      role="radio"
      aria-checked={isSelected}
      className="flex-1 flex items-center gap-3 py-4 px-4"
    >
      <method.Icon
        className={cn(
          "w-6 h-6 shrink-0",
          isSelected ? "text-[#7C3AED]" : "text-slate-400"
        )}
      />
      <div className="flex flex-col text-left">
        <Label asChild variant="option" className="text-slate-900">
          <Span unstyled>{method.label}</Span>
        </Label>
        <Span variant="caption" className="text-slate-500">{method.description}</Span>
      </div>
      {isSelected && (
        <Span unstyled className="ml-auto w-5 h-5 rounded-full bg-[#7C3AED] text-white text-xs flex items-center justify-center" aria-hidden="true">
          <Check className="w-3 h-3" />
        </Span>
      )}
    </Button>
  );
}
