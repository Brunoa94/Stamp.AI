"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkoutTheme } from "@/theme";
import { Button } from "@/features/ui/button";
import { CheckoutSelectors } from "@/features/checkout/context";

export function CheckoutMobileSummaryAccordion() {
  const [isOpen, setIsOpen] = useState(false);
  const m = checkoutTheme.mobile;

  const subtotal = CheckoutSelectors.subtotal();
  const shippingCost = CheckoutSelectors.shippingCost();
  const discount = CheckoutSelectors.discount();
  const total = subtotal + shippingCost - discount;

  return (
    <div className={m.summaryAccordion.container}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen((v) => !v)}
        className={m.summaryAccordion.header}
        aria-expanded={isOpen}
      >
        <span className={m.summaryAccordion.title}>Order Summary</span>
        <div className="flex items-center gap-2">
          <span className={m.summaryAccordion.total}>${total.toFixed(2)}</span>
          <ChevronDown
            className={cn(m.summaryAccordion.chevron, isOpen && "rotate-180")}
          />
        </div>
      </Button>

      {isOpen && (
        <div className={m.summaryAccordion.body}>
          <div className="space-y-2 text-base pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span
                className={
                  shippingCost === 0
                    ? "text-green-600 font-bold text-xs uppercase"
                    : ""
                }
              >
                {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
