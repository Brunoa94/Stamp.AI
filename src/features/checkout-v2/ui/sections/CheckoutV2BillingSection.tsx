/**
 * CheckoutV2BillingSection
 *
 * Billing address section. Uses the stamp-styled CheckoutV2AddressForm
 * inside the luxury brutalist section card.
 */

"use client";

import { CheckoutV2AddressForm } from "../components/CheckoutV2AddressForm";
import { CheckoutV2SectionCard } from "../components/CheckoutV2SectionCard";

export function CheckoutV2BillingSection() {
  return (
    <CheckoutV2SectionCard
      title="Billing Address"
      subtitle="Enter your billing information"
    >
      <CheckoutV2AddressForm fieldPrefix="billing" />
    </CheckoutV2SectionCard>
  );
}
