"use client";

import { useState } from "react";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { SectionHeader } from "@/features/ui/section-header";
import { Checkbox } from "@/features/ui/checkbox";
import { Label } from "@/features/ui/label";
import { Button } from "@/features/ui/button";
import { SHIPPING_METHODS, type ShippingMethodId } from "@/constants/checkout";
import { cn } from "@/lib/utils";
import ShippingAddressForm from "../shippingForm/ShippingAddressForm";

export function ShippingSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const { handleShippingSubmit } = useCheckoutSubscriberActions();
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodId>("standard");

  return (
    <section className="space-y-6">
      {/* Billing Address */}
      <div className="glass-card p-8 rounded-2xl">
        <SectionHeader title="Billing Address" />
        <ShippingAddressForm
          initialData={shippingAddress || undefined}
          onSubmit={handleShippingSubmit}
          showSubmitButton={false}
          autoSubmitOnChange={true}
        />
      </div>

      {/* Shipping Address */}
      <div className="glass-card p-8 rounded-2xl">
        <SectionHeader title="Shipping Address" className="mb-4" />
        <div className="flex items-center gap-3">
          <Checkbox id="same-as-billing" checked />
          <Label
            htmlFor="same-as-billing"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Same as billing address
          </Label>
        </div>
      </div>

      {/* Shipping Method */}
      <div className="glass-card p-8 rounded-2xl">
        <SectionHeader title="Shipping Method" className="mb-4" />
        <div
          className="space-y-3"
          role="radiogroup"
          aria-label="Shipping method"
        >
          {SHIPPING_METHODS.map((method) => {
            const isSelected = shippingMethod === method.id;
            return (
              <Button
                key={method.id}
                type="button"
                variant="outline"
                aria-label={`${method.label} - ${method.price}`}
                onClick={() => setShippingMethod(method.id)}
                className={cn(
                  "w-full h-auto py-4 px-5 flex items-center justify-between rounded-xl transition-all",
                  isSelected
                    ? "border-purple-400 ring-2 ring-purple-200 bg-purple-50/50"
                    : "border-slate-200 hover:border-purple-300",
                )}
              >
                <div className="flex items-center gap-3 text-left">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "border-purple-600" : "border-slate-300",
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-tight text-slate-900">
                      {method.label}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      {method.description}
                    </span>
                  </div>
                </div>
                <span className={cn("text-sm font-bold", method.priceClass)}>
                  {method.price}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
