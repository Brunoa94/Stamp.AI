/**
 * CheckoutBillingSection
 *
 * Billing address section. Uses the stamp-styled CheckoutAddressForm
 * inside the luxury brutalist section card.
 */

"use client";

import { CheckoutAddressForm } from "../components/CheckoutAddressForm";
import { CheckoutSectionCard } from "../components/CheckoutSectionCard";

export function CheckoutBillingSection() {
  return (
    <CheckoutSectionCard
      title="Billing Address"
      subtitle="Enter your billing information"
    >
      <CheckoutAddressForm fieldPrefix="billing" />
    </CheckoutSectionCard>
  );
}
