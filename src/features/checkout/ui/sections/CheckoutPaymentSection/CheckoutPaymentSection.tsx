/**
 * CheckoutPaymentSection
 *
 * Payment-method selection and input. Reuses the checkout form context for
 * the selected method; composes the restyled selector, Stripe card form, and
 * PayPal notice.
 */

"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { CheckoutSectionCard } from "../../components/CheckoutSectionCard";
import { CheckoutPaymentMethods } from "./CheckoutPaymentMethods";
import { CheckoutStripeCardForm } from "./CheckoutStripeCardForm";
import { SecureCheckoutNotice } from "@/features/ui/trust/SecureCheckoutNotice";
import type { CheckoutFormData } from "@/features/checkout/lib/context/CheckoutFormContext";
import type { PaymentMethodT } from "@/types/payment";

interface CheckoutPaymentSectionPropsI {
  testMode: boolean;
  selectedTestMethod: string;
  onTestMethodChange: (method: string) => void;
}

export function CheckoutPaymentSection({
  testMode,
  selectedTestMethod,
  onTestMethodChange,
}: CheckoutPaymentSectionPropsI) {
  const t = useTranslations("checkout.payment");
  const { watch, setValue } = useFormContext<CheckoutFormData>();
  const selectedMethod = watch("paymentMethod");

  const handleMethodChange = (method: PaymentMethodT) => {
    setValue("paymentMethod", method);
  };

  return (
    <CheckoutSectionCard
      title={t("title")}
      subtitle={t("subtitle")}
    >
      <CheckoutPaymentMethods
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
      />

      {selectedMethod === "stripe" && (
        <CheckoutStripeCardForm
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
          {t("paypalNotice")}
        </p>
      )}

      <SecureCheckoutNotice className="mt-6" />
    </CheckoutSectionCard>
  );
}
