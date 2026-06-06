"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/features/ui/button";
import { usePaymentForm } from "../PaymentForm/usePaymentForm";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";

interface StripePaymentButtonProps {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  cartId?: string;
  testMode?: boolean;
  selectedTestMethod?: string;
  disabled?: boolean;
}

/**
 * StripePaymentButton - Stripe payment submission button
 * Integrates with usePaymentForm hook for Stripe payment processing
 */
export function StripePaymentButton({
  amount,
  lineItems,
  shippingAddress,
  cartId,
  testMode = false,
  selectedTestMethod = "visa",
  disabled = false,
}: StripePaymentButtonProps) {
  const router = useRouter();

  // Memoize callbacks to prevent infinite loops
  const handleSuccess = useCallback((paymentIntent: any, processedLineItems: PrintifyLineItem[]) => {
    console.log("✅ Stripe payment successful:", paymentIntent);

    // Store payment data in localStorage for the return page
    const checkoutData = {
      paymentIntentId: paymentIntent.id,
      amount,
      lineItems: processedLineItems,
      shippingAddress,
      cartId: cartId || null,
      timestamp: Date.now(),
    };
    localStorage.setItem("stripe_checkout_data", JSON.stringify(checkoutData));

    // Redirect to success page with payment intent ID
    const searchParams = new URLSearchParams({
      payment_intent: paymentIntent.id,
      payment_intent_client_secret: paymentIntent.client_secret || "",
    });
    router.push(`/checkout/stripe-return?${searchParams.toString()}`);
  }, [router, amount, shippingAddress, cartId]);

  const handleError = useCallback((errorMessage: string) => {
    console.error("❌ Stripe payment failed:", errorMessage);
    // Error is handled by the hook's error state
  }, []);

  const {
    loading,
    error,
    handleSubmit,
    setSelectedTestMethod,
  } = usePaymentForm({
    amount,
    lineItems,
    shippingAddress,
    testMode,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // Sync selected test method if in test mode (using useEffect to avoid render loop)
  useEffect(() => {
    if (testMode && selectedTestMethod) {
      setSelectedTestMethod(selectedTestMethod);
    }
  }, [testMode, selectedTestMethod, setSelectedTestMethod]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await handleSubmit(e as any);
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full h-14 font-heading tracking-widest text-sm shadow-2xl shadow-purple-500/50 hover:-translate-y-1.5 hover:shadow-3xl transition-all duration-300"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Processing...
          </span>
        ) : (
          `PAY $${amount.toFixed(2)}`
        )}
      </Button>

      {error && (
        <div role="alert" className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}
    </>
  );
}
