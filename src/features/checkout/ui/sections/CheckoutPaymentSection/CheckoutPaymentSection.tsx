/**
 * CheckoutPaymentSection
 *
 * Payment-method selection and input. Reuses the checkout form context for
 * the selected method; composes the restyled selector, Stripe card form, and
 * PayPal notice.
 */

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { CheckoutSectionCard } from "../../components/CheckoutSectionCard";
import { CheckoutPaymentMethods } from "./CheckoutPaymentMethods";
import { CheckoutStripeCardForm } from "./CheckoutStripeCardForm";
import { SecureCheckoutNotice } from "@/features/ui/trust/SecureCheckoutNotice";
import { PaymentSecurityBadge } from "@/features/ui/trust/PaymentSecurityBadge";
import { Paragraph } from "@/features/ui/paragraph";
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
    <CheckoutSectionCard title={t("title")}>
      <CheckoutPaymentMethods
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
      />

      {/* Security badge next to payment form */}
      <PaymentSecurityBadge variant="inline" className="mt-4" />

      {selectedMethod === "stripe" && (
        <CheckoutStripeCardForm
          testMode={testMode}
          selectedTestMethod={selectedTestMethod}
          onTestMethodChange={onTestMethodChange}
        />
      )}

      {selectedMethod === "paypal" && (
        <Paragraph
          variant="xs"
          unstyled
          role="status"
          className="mt-6 border border-(--color-stamp-info)/20 bg-(--color-stamp-info)/5 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-(--color-stamp-info)"
        >
          {t("paypalNotice")}
        </Paragraph>
      )}

      {selectedMethod === "ideal" && (
        <Paragraph
          variant="xs"
          unstyled
          role="status"
          className="mt-6 border border-(--color-stamp-info)/20 bg-(--color-stamp-info)/5 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-(--color-stamp-info)"
        >
          {t("idealNotice")}
        </Paragraph>
      )}

      <SecureCheckoutNotice className="mt-6" />
    </CheckoutSectionCard>
  );
}
