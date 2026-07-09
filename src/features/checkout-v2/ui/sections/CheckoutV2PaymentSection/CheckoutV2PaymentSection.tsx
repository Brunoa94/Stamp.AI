/**
 * CheckoutV2PaymentSection
 *
 * Payment-method selection and input. Reuses the checkout form context for
 * the selected method; composes the restyled selector, Stripe card form, and
 * PayPal notice.
 */

"use client";

import { useFormContext } from "react-hook-form";
import { CheckoutV2SectionCard } from "../../components/CheckoutV2SectionCard";
import { CheckoutV2PaymentMethods } from "./CheckoutV2PaymentMethods";
import { CheckoutV2StripeCardForm } from "./CheckoutV2StripeCardForm";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import type { PaymentMethodT } from "@/types/payment";

interface CheckoutV2PaymentSectionPropsI {
  testMode: boolean;
  selectedTestMethod: string;
  onTestMethodChange: (method: string) => void;
}

export function CheckoutV2PaymentSection({
  testMode,
  selectedTestMethod,
  onTestMethodChange,
}: CheckoutV2PaymentSectionPropsI) {
  const { watch, setValue } = useFormContext<CheckoutFormData>();
  const selectedMethod = watch("paymentMethod");

  const handleMethodChange = (method: PaymentMethodT) => {
    setValue("paymentMethod", method);
  };

  return (
    <CheckoutV2SectionCard
      title="Payment Method"
      subtitle="Select your preferred payment method"
    >
      <CheckoutV2PaymentMethods
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
      />

      {selectedMethod === "stripe" && (
        <CheckoutV2StripeCardForm
          testMode={testMode}
          selectedTestMethod={selectedTestMethod}
          onTestMethodChange={onTestMethodChange}
        />
      )}

      {selectedMethod === "paypal" && (
        <p
          role="status"
          className="mt-6 border border-(--color-stamp-info)/20 bg-(--color-stamp-info)/5 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-(--color-stamp-info)"
        >
          You will be redirected to PayPal to complete your payment securely.
        </p>
      )}
    </CheckoutV2SectionCard>
  );
}
