"use client";

import { SectionCard } from "../components/SectionCard";
import { AddressForm } from "../components/AddressForm";
import { SectionHeader } from "@/features/ui/section-header";

/**
 * BillingAddressSection - Billing address form section
 * Refactored to use atoms and molecules for better code reuse
 */
export function BillingAddressSection() {
  return (
    <SectionCard>
      <SectionHeader
        title="Billing Address"
        subtitle="Enter your billing information"
        className="mb-0"
      />
      <AddressForm fieldPrefix="billing" />
    </SectionCard>
  );
}
