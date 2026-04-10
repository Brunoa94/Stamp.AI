"use client";

import { useCallback, useMemo, useState } from "react";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { PayPalOnApproveDataI } from "@/types/payment";
import { useCapturePayPalOrder, useCreatePayPalOrder } from "@/queries";

export interface PayPalSuccessDetailsI {
  id: string;
  captureId: string;
  status: string;
  payerEmail?: string;
}

interface UsePayPalButtonParamsI {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  orderId?: string;
  testMode?: boolean;
  onSuccess?: (
    details: PayPalSuccessDetailsI,
    lineItems: PrintifyLineItem[],
  ) => void | Promise<void>;
  onError?: (error: string) => void;
}

interface PayPalOnApproveActionsI {
  restart?: () => Promise<void>;
}

export function usePayPalButton({
  amount,
  lineItems,
  shippingAddress,
  orderId,
  testMode = false,
  onSuccess,
  onError,
}: UsePayPalButtonParamsI) {
  const [error, setError] = useState<string | null>(null);

  const createPayPalOrder = useCreatePayPalOrder();
  const capturePayPalOrder = useCapturePayPalOrder();

  const loading = createPayPalOrder.isPending || capturePayPalOrder.isPending;

  const handleOperationError = useCallback(
    (err: unknown, fallbackMessage: string) => {
      const errorMessage = err instanceof Error ? err.message : fallbackMessage;
      setError(errorMessage);
      onError?.(errorMessage);
      return errorMessage;
    },
    [onError],
  );

  const createOrder = useCallback(async (): Promise<string> => {
    setError(null);

    try {
      const response = await createPayPalOrder.mutateAsync({
        amount,
        lineItems,
        shippingAddress,
        orderId,
        testMode,
      });

      return response.orderId;
    } catch (err) {
      handleOperationError(err, "Failed to create PayPal order");
      throw err;
    }
  }, [
    amount,
    lineItems,
    shippingAddress,
    orderId,
    testMode,
    createPayPalOrder,
    handleOperationError,
  ]);

  const onApprove = useCallback(
    async (data: PayPalOnApproveDataI, actions?: PayPalOnApproveActionsI) => {
      setError(null);

      try {
        const captureData = await capturePayPalOrder.mutateAsync({
          orderId: data.orderID,
          payerId: data.payerID,
        });

        if (!captureData.success) {
          if (captureData.restartable && actions?.restart) {
            await actions.restart();
            return;
          }

          throw new Error(captureData.error || "PAYPAL_CAPTURE_FAILED");
        }

        if (!captureData.captureId) {
          throw new Error("PAYPAL_CAPTURE_FAILED");
        }

        await onSuccess?.(
          {
            id: data.orderID,
            captureId: captureData.captureId,
            status: "succeeded",
            payerEmail: captureData.payerEmail,
          },
          lineItems,
        );
      } catch (err) {
        handleOperationError(err, "Payment capture failed");
      }
    },
    [capturePayPalOrder, onSuccess, lineItems, handleOperationError],
  );

  const onButtonError = useCallback(
    (err: Record<string, unknown>) => {
      console.error("PayPal error:", err);
      const errorMessage =
        typeof err.message === "string" ? err.message : "PayPal payment failed";
      setError(errorMessage);
      onError?.(errorMessage);
    },
    [onError],
  );

  const onCancel = useCallback(() => {
    const errorMessage = "Payment was cancelled";
    setError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const forceReRenderDeps = useMemo(
    () => [amount, shippingAddress, lineItems],
    [amount, shippingAddress, lineItems],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    loading,
    createOrder,
    onApprove,
    onButtonError,
    onCancel,
    forceReRenderDeps,
    clearError,
  };
}
