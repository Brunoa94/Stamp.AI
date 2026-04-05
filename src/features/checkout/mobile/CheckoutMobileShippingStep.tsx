"use client";

import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import type { ShippingAddressT } from "@/schemas/checkout";
import { ShippingAddressForm } from "../shippingForm";

interface CheckoutMobileShippingStepProps {
  onComplete: () => void;
}

export function CheckoutMobileShippingStep({
  onComplete,
}: CheckoutMobileShippingStepProps) {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const { handleShippingSubmit } = useCheckoutSubscriberActions();

  function handleSubmit(data: ShippingAddressT) {
    handleShippingSubmit(data);
    onComplete();
  }

  return (
    <ShippingAddressForm
      initialData={shippingAddress || undefined}
      onSubmit={handleSubmit}
      showSubmitButton={true}
      autoSubmitOnChange={false}
      submitLabel="Continue to Shipping"
    />
  );
}
