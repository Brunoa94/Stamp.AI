/**
 * CheckoutV2BillingSection
 *
 * Billing address section. Reuses the shared AddressForm (design-system
 * form fields) inside the luxury brutalist section card.
 */

"use client";

import { AddressForm } from "@/features/checkout/ui/components/AddressForm";
import { CheckoutV2SectionCard } from "../components/CheckoutV2SectionCard";

export function CheckoutV2BillingSection() {
  return (
    <CheckoutV2SectionCard
      title="Billing Address"
      subtitle="Enter your billing information"
    >
      <AddressForm fieldPrefix="billing" />
    </CheckoutV2SectionCard>
  );
}
