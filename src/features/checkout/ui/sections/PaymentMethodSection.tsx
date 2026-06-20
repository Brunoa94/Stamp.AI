"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { SectionCard } from "../components/SectionCard";
import { StripeCardForm } from "../components/StripeCardForm";
import { PaymentMethodSelector } from "../PaymentMethodSelector/PaymentMethodSelector";
import { SectionHeader } from "@/features/ui/section-header";
import type { CheckoutFormData } from "../../lib/context/CheckoutFormContext";
import type { PaymentMethodT } from "@/types/payment";

interface PaymentMethodSectionProps {
  testMode?: boolean;
  selectedTestMethod?: string;
  onTestMethodChange?: (method: string) => void;
}

/**
 * PaymentMethodSection - Payment method selection and input
 * Refactored to use atoms and molecules for better separation of concerns
 */
export function PaymentMethodSection({
  testMode = false,
  selectedTestMethod: externalSelectedTestMethod,
  onTestMethodChange: externalOnTestMethodChange,
}: PaymentMethodSectionProps) {
  const { watch, setValue } = useFormContext<CheckoutFormData>();
  const selectedMethod = watch("paymentMethod");
  const [internalSelectedTestMethod, setInternalSelectedTestMethod] = useState<string>("visa");

  // Use external state if provided, otherwise use internal
  const selectedTestMethod = externalSelectedTestMethod ?? internalSelectedTestMethod;
  const setSelectedTestMethod = externalOnTestMethodChange ?? setInternalSelectedTestMethod;

  const handleMethodChange = (method: PaymentMethodT) => {
    setValue("paymentMethod", method);
  };

  return (
    <SectionCard>
      <SectionHeader
        title="Payment Method"
        subtitle="Select your preferred payment method"
        className="mb-0"
      />

      <PaymentMethodSelector
        selectedMethod={selectedMethod}
        onMethodChange={handleMethodChange}
      />

      {/* Stripe Card Form */}
      {selectedMethod === "stripe" && (
        <StripeCardForm
          testMode={testMode}
          selectedTestMethod={selectedTestMethod}
          onTestMethodChange={setSelectedTestMethod}
        />
      )}

      {/* PayPal Info */}
      {selectedMethod === "paypal" && (
        <div role="status" className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            You will be redirected to PayPal to complete your payment securely.
          </p>
        </div>
      )}
    </SectionCard>
  );
}
