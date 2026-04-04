"use client";

import { useState } from "react";
import ShippingAddressForm from "@/features/checkout/shippingForm/ShippingAddressForm";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { SectionHeader } from "@/features/ui/section-header";
import clsx from "clsx";

export function ShippingSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const { handleShippingSubmit } = useCheckoutSubscriberActions();
  const [shippingMethod, setShippingMethod] = useState("standard");

  return (
    <section className="space-y-8">
      {/* Billing Address */}
      <div className="glass-card p-8 rounded-none">
        <SectionHeader title="Billing Address" />

        <ShippingAddressForm
          initialData={shippingAddress || undefined}
          onSubmit={handleShippingSubmit}
          showSubmitButton={false}
          autoSubmitOnChange={true}
        />
      </div>

      {/* Shipping Address */}
      <div className="glass-card p-8 rounded-none">
        <SectionHeader title="Shipping Address" className="mb-4" />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked
            readOnly
            className="h-5 w-5 rounded-none accent-purple-600"
          />
          <span className="text-sm font-medium text-slate-700">
            Same as billing address
          </span>
        </label>
      </div>

      {/* Shipping Method */}
      <div className="glass-card p-8 rounded-none">
        <SectionHeader title="Shipping Method" className="mb-4" />

        <div className="space-y-4">
          <label
            className={clsx(
              "flex items-center justify-between p-4 border border-slate-200 cursor-pointer transition-colors",
              shippingMethod === "standard" && "border-purple-300",
            )}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="shipping-method"
                checked={shippingMethod === "standard"}
                onChange={() => setShippingMethod("standard")}
                className="h-4 w-4 accent-purple-600"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-tight">
                  Standard Shipping
                </span>
                <span className="text-xs text-slate-500">
                  3-5 Business Days
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-green-600 uppercase">
              Free
            </span>
          </label>

          <label
            className={clsx(
              "flex items-center justify-between p-4 border border-slate-200 cursor-pointer transition-colors",
              shippingMethod === "express" && "border-purple-300",
            )}
          >
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="shipping-method"
                checked={shippingMethod === "express"}
                onChange={() => setShippingMethod("express")}
                className="h-4 w-4 accent-purple-600"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold uppercase tracking-tight">
                  Express Delivery
                </span>
                <span className="text-xs text-slate-500">
                  1-2 Business Days
                </span>
              </div>
            </div>
            <span className="text-sm font-bold">$10.00</span>
          </label>
        </div>
      </div>
    </section>
  );
}
