"use client";

import { useState } from "react";
import clsx from "clsx";
import { checkoutTheme } from "@/theme";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { SHIPPING_METHODS } from "./const/shipping-methods";
import type { ShippingMethod } from "./const/shipping-methods";

interface CheckoutMobileShippingMethodStepProps {
  onComplete: () => void;
}

export function CheckoutMobileShippingMethodStep({
  onComplete,
}: CheckoutMobileShippingMethodStepProps) {
  const [selected, setSelected] = useState<ShippingMethod>("standard");
  const m = checkoutTheme.mobile;

  return (
    <div>
      <div className="space-y-3 mb-1">
        {SHIPPING_METHODS.map((method) => (
          <Label
            key={method.id}
            className={clsx(
              "flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors",
              selected === method.id
                ? "border-[#7C3AED] bg-purple-50/40"
                : "border-slate-200 bg-white/50",
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="mobile-shipping-method"
                checked={selected === method.id}
                onChange={() => setSelected(method.id)}
                className="h-4 w-4 accent-purple-600"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold uppercase tracking-tight text-slate-900">
                  {method.label}
                </span>
                <span className="text-sm text-slate-500">
                  {method.description}
                </span>
              </div>
            </div>
            <span className={method.priceClass}>{method.price}</span>
          </Label>
        ))}
      </div>

      <Button onClick={onComplete} className={m.stepCta}>
        Confirm Method
      </Button>
    </div>
  );
}
