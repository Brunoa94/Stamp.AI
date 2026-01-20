"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ShippingAddressT } from "@/schemas/checkout";
import ShippingAddressForm from "@/features/checkout/shippingForm/ShippingAddressForm";
import PaymentForm, {
  PaymentFormRef,
} from "@/features/checkout/paymentForm/PaymentForm";
import OrderSummary from "@/features/checkout/paymentForm/OrderSummary";
import {
  PaymentSuccess,
  PaymentError,
  CheckoutHeader,
  CheckoutLoading,
  CheckoutError,
  TrustBanner,
} from "@/features/checkout/components";
import { useCheckoutData, useCustomization } from "@/features/checkout/hooks";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";

type PaymentStatus = "idle" | "success" | "error";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // Fetch all checkout data using custom hook
  const { order, orderItems, customProduct, isLoading, error } =
    useCheckoutData(orderId);

  // Build customization from fetched data
  const customization = useCustomization({
    order,
    orderItems,
    customProduct,
    isLoading,
  });

  // Local state for checkout flow
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddressT | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [message, setMessage] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const paymentFormRef = useRef<PaymentFormRef>(null);

  // Event handlers
  const handleShippingSubmit = (data: ShippingAddressT) => {
    setShippingAddress(data);
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setIsProcessingPayment(false);
    setPaymentStatus("success");
    setMessage(`Payment successful! Payment ID: ${paymentIntent.id}`);
  };

  const handlePaymentError = (errorMsg: string) => {
    setIsProcessingPayment(false);
    setPaymentStatus("error");
    setMessage(errorMsg);
  };

  const handleCompleteOrder = () => {
    if (!shippingAddress) {
      return;
    }
    setIsProcessingPayment(true);
    paymentFormRef.current?.submitPayment();
  };

  const handleCreateAnother = () => {
    setPaymentStatus("idle");
    setShippingAddress(null);
    setMessage("");
    setIsProcessingPayment(false);
  };

  const handleTryAgain = () => {
    setPaymentStatus("idle");
    setMessage("");
    setIsProcessingPayment(false);
  };

  // Calculate order amounts with fallbacks
  const subtotal = order?.subtotal || customization.price * customization.quantity;
  const shippingCost = order?.shipping_cost || 5.99;
  const discount = order?.discount_amount || 0;
  const orderAmount = subtotal + shippingCost - discount;

  // Build line items for payment
  const printAreasArray = Object.entries(customization.print_areas)
    .filter(([_, imageId]) => imageId)
    .map(([position, imageId]) => ({
      position,
      image_id: imageId,
    }));

  const lineItems = [
    {
      product_id: customization.product_id || "",
      variant_id: customization.variant_id,
      quantity: customization.quantity,
      print_areas: printAreasArray,
      print_provider_id: customization.print_provider_id || 99,
    },
  ];

  // Loading state
  if (isLoading) {
    return <CheckoutLoading />;
  }

  // Error state
  if (error) {
    return <CheckoutError error={error} />;
  }

  // Payment success state
  if (paymentStatus === "success") {
    return (
      <PaymentSuccess message={message} onCreateAnother={handleCreateAnother} />
    );
  }

  // Payment error state
  if (paymentStatus === "error") {
    return <PaymentError message={message} onTryAgain={handleTryAgain} />;
  }

  // Main checkout form
  return (
    <div className={clsx(componentThemes.container.page, "py-8")}>
      <div className="max-w-6xl mx-auto px-4">
        <CheckoutHeader
          shippingAddress={shippingAddress}
          isProcessingPayment={isProcessingPayment}
          paymentStatus={paymentStatus}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            {/* Shipping Address Section */}
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

            {/* Payment Section */}
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
                    ref={paymentFormRef}
                    amount={orderAmount}
                    lineItems={lineItems}
                    shippingAddress={shippingAddress}
                    customization={customization}
                    testMode={testMode}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    hideButton={true}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Please fill in your shipping address first</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside>
            <OrderSummary
              customization={customization}
              shippingAddress={
                shippingAddress || {
                  first_name: "",
                  last_name: "",
                  email: "",
                  phone: "",
                  country: "US",
                  region: "",
                  address1: "",
                  address2: "",
                  city: "",
                  zip: "",
                }
              }
              orderAmount={subtotal}
              shippingCost={shippingCost}
              discount={discount}
              onEditShipping={() => {}}
              onCompleteOrder={handleCompleteOrder}
              isProcessingPayment={isProcessingPayment}
              onPromoCodeApply={(code) => {
                console.log("Promo code applied:", code);
              }}
            />

            {/* Trust Banner */}
            <TrustBanner />
          </aside>
        </div>
      </div>
    </div>
  );
}
