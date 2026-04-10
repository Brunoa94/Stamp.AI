"use client";

import { useCallback, useState } from "react";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { useCreateMolliePayment } from "@/queries/mollieQueries";

export interface MollieRedirectDetailsI {
  paymentId: string;
  checkoutUrl: string;
}

interface UseMollieButtonParamsI {
  amount: number;
  currency?: string;
  description?: string;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  orderId?: string;
  testMode?: boolean;
  onRedirect?: (details: MollieRedirectDetailsI) => void;
  onError?: (error: string) => void;
}

export function useMollieButton({
  amount,
  currency = "EUR",
  description,
  lineItems,
  shippingAddress,
  orderId,
  testMode = false,
  onRedirect,
  onError,
}: UseMollieButtonParamsI) {
  const [error, setError] = useState<string | null>(null);

  const createMolliePayment = useCreateMolliePayment();

  const loading = createMolliePayment.isPending;

  const handleOperationError = useCallback(
    (err: unknown, fallbackMessage: string) => {
      const errorMessage = err instanceof Error ? err.message : fallbackMessage;
      setError(errorMessage);
      onError?.(errorMessage);
      return errorMessage;
    },
    [onError],
  );

  const handlePayment = useCallback(async () => {
    setError(null);

    try {
      const response = await createMolliePayment.mutateAsync({
        amount,
        currency,
        description,
        lineItems,
        shippingAddress,
        orderId,
        testMode,
      });

      // Store payment ID in sessionStorage for return page
      if (typeof window !== "undefined") {
        const cartIdFromUrl = new URLSearchParams(window.location.search).get("cartId");
        sessionStorage.setItem("mollie_payment_id", response.paymentId);
        sessionStorage.setItem("mollie_line_items", JSON.stringify(lineItems));
        sessionStorage.setItem("mollie_shipping_address", JSON.stringify(shippingAddress));
        if (cartIdFromUrl) {
          sessionStorage.setItem("mollie_cart_id", cartIdFromUrl);
        }
      }

      // Notify parent and redirect
      onRedirect?.({
        paymentId: response.paymentId,
        checkoutUrl: response.checkoutUrl,
      });

      // Redirect to Mollie checkout
      window.location.href = response.checkoutUrl;
    } catch (err) {
      handleOperationError(err, "Failed to create Mollie payment");
    }
  }, [
    amount,
    currency,
    description,
    lineItems,
    shippingAddress,
    orderId,
    testMode,
    createMolliePayment,
    onRedirect,
    handleOperationError,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    loading,
    handlePayment,
    clearError,
  };
}
