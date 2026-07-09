/**
 * CheckoutV2ShippingSection
 *
 * Optional shipping address section, conditionally rendered based on the
 * useShippingAddress toggle. Reuses the shared AddressForm.
 */

"use client";

import { useFormContext } from "react-hook-form";
import { AddressForm } from "@/features/checkout/ui/components/AddressForm";
import { CheckoutV2SectionCard } from "../components/CheckoutV2SectionCard";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

export function CheckoutV2ShippingSection() {
  const { watch } = useFormContext<CheckoutFormData>();
  const useShippingAddress = watch("useShippingAddress");

  if (!useShippingAddress) return null;

  return (
    <CheckoutV2SectionCard
      title="Shipping Address"
      subtitle="Enter where you want your order shipped"
    >
      <AddressForm fieldPrefix="shipping" />
    </CheckoutV2SectionCard>
  );
}
