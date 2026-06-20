"use client";

import { useFormContext } from "react-hook-form";
import { SectionCard } from "../components/SectionCard";
import { AddressForm } from "../components/AddressForm";
import { SectionHeader } from "@/features/ui/section-header";
import { CheckoutFormData } from "../../lib/context/CheckoutFormContext";

/**
 * ShippingAddressSection - Shipping address form section
 * Refactored to use atoms and molecules for better code reuse
 * Conditionally rendered based on useShippingAddress toggle
 */
export function ShippingAddressSection() {
  const { watch } = useFormContext<CheckoutFormData>();
  const useShippingAddress = watch("useShippingAddress");

  // Don't render if shipping address is not enabled
  if (!useShippingAddress) return null;

  return (
    <SectionCard>
      <SectionHeader
        title="Shipping Address"
        subtitle="Enter where you want your order shipped"
        className="mb-0"
      />
      <AddressForm fieldPrefix="shipping" />
    </SectionCard>
  );
}
