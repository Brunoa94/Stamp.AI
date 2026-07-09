/**
 * CheckoutV2ShippingSection
 *
 * Optional shipping address section, conditionally rendered based on the
 * useShippingAddress toggle. Uses the stamp-styled CheckoutV2AddressForm.
 */

"use client";

import { useFormContext } from "react-hook-form";
import { CheckoutV2AddressForm } from "../components/CheckoutV2AddressForm";
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
      <CheckoutV2AddressForm fieldPrefix="shipping" />
    </CheckoutV2SectionCard>
  );
}
