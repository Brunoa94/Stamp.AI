"use client";

import { CreditCard, Check } from "lucide-react";
import { FaPaypal } from "react-icons/fa";
import { cn } from "@/lib/utils";
import type { PaymentMethodT } from "@/types/payment";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";

interface Props {
  selectedMethod: PaymentMethodT;
  onMethodChange: (method: PaymentMethodT) => void;
  disabled?: boolean;
}

const paymentMethods = [
  {
    id: "stripe" as const,
    label: "Credit Card",
    description: "Visa, Mastercard, Amex",
    Icon: CreditCard,
  },
  {
    id: "paypal" as const,
    label: "PayPal",
    description: "PayPal, Venmo, Pay Later",
    Icon: FaPaypal,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false,
}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Select payment method"
      className="flex gap-3 mb-6"
      data-disabled={disabled || undefined}
    >
      {paymentMethods.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <Button
            key={method.id}
            type="button"
            variant="outline"
            onClick={() => onMethodChange(method.id)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            className={cn(
              "flex-1 h-auto py-4 px-4 justify-start gap-3 transition-all duration-200",
              isSelected
                ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm hover:bg-[#7C3AED]/5"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <method.Icon
              className={cn(
                "w-6 h-6 shrink-0",
                isSelected ? "text-[#7C3AED]" : "text-slate-400",
              )}
            />
            <div className="flex flex-col text-left">
              <Label
                asChild
                className="font-heading text-sm tracking-wider text-slate-900 cursor-pointer"
              >
                <span>{method.label}</span>
              </Label>
              <span className="text-xs text-slate-500">
                {method.description}
              </span>
            </div>
            {isSelected && (
              <span
                className="ml-auto w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center"
                aria-hidden="true"
              >
                <Check className="w-3 h-3" />
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
