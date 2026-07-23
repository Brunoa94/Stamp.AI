/**
 * CheckoutBillingSection
 *
 * Billing address section. Uses the stamp-styled CheckoutAddressForm
 * inside the luxury brutalist section card.
 */


import { useTranslations } from "next-intl";
import { CheckoutAddressForm } from "../components/CheckoutAddressForm";
import { CheckoutSectionCard } from "../components/CheckoutSectionCard";

export function CheckoutBillingSection() {
  const t = useTranslations("checkout.billing");

  return (
    <CheckoutSectionCard
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <CheckoutAddressForm fieldPrefix="billing" />
    </CheckoutSectionCard>
  );
}
