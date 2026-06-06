"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethodT } from "@/types/payment";
import { PAYMENT_BRAND_STYLES, PAYMENT_METHODS } from "@/constants/payment";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";

interface Props {
  selectedMethod: PaymentMethodT;
  onMethodChange: (method: PaymentMethodT) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  disabled = false,
}: Props) {
  const paymentMethods = PAYMENT_METHODS;

  return (
    <div
      role="radiogroup"
      aria-label="Select payment method"
      className="flex flex-wrap gap-3 mb-6"
      data-disabled={disabled || undefined}
    >
      {paymentMethods.map((method) => {
        const isSelected = selectedMethod === method.id;
        const brand = PAYMENT_BRAND_STYLES[method.id];
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
                ? cn(brand.border, brand.bg, "shadow-sm")
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <method.Icon
              className={cn(
                "w-6 h-6 shrink-0",
                isSelected ? brand.icon : "text-slate-400",
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
                className={cn(
                  "ml-auto w-5 h-5 rounded-full text-white flex items-center justify-center",
                  brand.check,
                )}
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
