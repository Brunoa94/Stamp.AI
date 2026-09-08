/**
 * CheckoutShippingSection
 *
 * Optional shipping address section, conditionally rendered based on the
 * useShippingAddress toggle. Uses the stamp-styled CheckoutAddressForm.
 */

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { CheckoutAddressForm } from "../components/CheckoutAddressForm";
import { CheckoutSectionCard } from "../components/CheckoutSectionCard";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";

export function CheckoutShippingSection() {
  const t = useTranslations("checkout.shipping");
  const { watch } = useFormContext<CheckoutFormData>();
  const useShippingAddress = watch("useShippingAddress");

  if (!useShippingAddress) return null;

  return (
    <CheckoutSectionCard title={t("title")}>
      <CheckoutAddressForm fieldPrefix="shipping" />
    </CheckoutSectionCard>
  );
}
