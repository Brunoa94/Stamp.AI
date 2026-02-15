"use client";

import PaymentForm from "@/features/checkout/paymentForm/PaymentForm";
import {
  CheckoutSelectors,
  useCheckoutSubscriberActions,
} from "@/features/checkout/context";
import { componentThemes } from "@/theme/components";

export function PaymentSection() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const testMode = CheckoutSelectors.testMode();
  const triggerPayment = CheckoutSelectors.triggerPayment();
  const orderAmount = CheckoutSelectors.orderAmount();

  const {
    setTestMode,
    handlePaymentSuccess,
    handlePaymentError,
    handlePaymentSubmitComplete,
  } = useCheckoutSubscriberActions();

  console.log("✅ PaymentSection: Rendering payment form");

  return (
    <section className={componentThemes.card.base}>
      <div className="p-8">
        <header className="mb-6">
          <h2 className={componentThemes.text.subheading}>Payment</h2>
          <p className={componentThemes.text.caption}>
            Complete your purchase securely
          </p>
        </header>

        {/* Test Mode Toggle */}
        <div className="mb-6 flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <input
            type="checkbox"
            id="testMode"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500 rounded"
          />
          <label htmlFor="testMode" className="text-sm text-gray-700">
            Test Mode (use predefined payment methods)
          </label>
        </div>

        {shippingAddress ? (
          <PaymentForm
            lineItems={[]}
            amount={orderAmount}
            shippingAddress={shippingAddress}
            testMode={testMode}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            hideButton={true}
            triggerSubmit={triggerPayment}
            onSubmitComplete={handlePaymentSubmitComplete}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Please fill in your shipping address first</p>
          </div>
        )}
      </div>
    </section>
  );
}
