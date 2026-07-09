/**
 * CheckoutShippingSection
 *
 * Optional shipping address section, conditionally rendered based on the
 * useShippingAddress toggle. Uses the stamp-styled CheckoutAddressForm.
 */

"use client";

import { useFormContext } from "react-hook-form";
import { CheckoutAddressForm } from "../components/CheckoutAddressForm";
import { CheckoutSectionCard } from "../components/CheckoutSectionCard";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

export function CheckoutShippingSection() {
  const { watch } = useFormContext<CheckoutFormData>();
  const useShippingAddress = watch("useShippingAddress");

  if (!useShippingAddress) return null;

  return (
    <CheckoutSectionCard
      title="Shipping Address"
      subtitle="Enter where you want your order shipped"
    >
      <CheckoutAddressForm fieldPrefix="shipping" />
    </CheckoutSectionCard>
  );
}
