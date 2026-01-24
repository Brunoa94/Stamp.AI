"use client";

import ShippingAddressForm from "@/features/checkout/shippingForm/ShippingAddressForm";
import { CheckoutSelectors, useCheckoutSubscriberActions } from "@/features/checkout/context";
import { componentThemes } from "@/theme/components";

export function ShippingSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const { handleShippingSubmit } = useCheckoutSubscriberActions();

  return (
    <section className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>
            Shipping Address
          </h2>
          <p className={componentThemes.text.caption}>
            Enter your shipping information
          </p>
        </header>

        <ShippingAddressForm
          initialData={shippingAddress || undefined}
          onSubmit={handleShippingSubmit}
          showSubmitButton={false}
          autoSubmitOnChange={true}
        />
      </div>
    </section>
  );
}
