"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  paypalScriptOptions,
  paypalButtonStyles,
  isPayPalConfigured,
} from "@/lib/paypal";
import { checkoutTheme } from "@/theme/components";
import { CheckoutErrorDisplay } from "../components";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { usePayPalButton, type PayPalSuccessDetailsI } from "./usePayPalButton";

interface Props {
  amount: number;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  orderId?: string;
  testMode?: boolean;
  onSuccess?: (
    details: PayPalSuccessDetailsI,
    lineItems: PrintifyLineItem[],
  ) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function PayPalButton({
  amount,
  lineItems,
  shippingAddress,
  orderId,
  testMode = false,
  onSuccess,
  onError,
  disabled = false,
}: Props) {
  const styles = checkoutTheme.paypalButton;
  const {
    error,
    loading,
    createOrder,
    onButtonError,
    onCancel,
    forceReRenderDeps,
    clearError,
  } = usePayPalButton({
    amount,
    lineItems,
    shippingAddress,
    orderId,
    testMode,
    onSuccess,
    onError,
  });

  // Check if PayPal is configured
  if (!isPayPalConfigured()) {
    return (
      <div className={styles.error}>
        PayPal is not configured. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to
        your environment variables.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <CheckoutErrorDisplay error={error} onDismiss={clearError} />}

      <PayPalScriptProvider options={paypalScriptOptions}>
        <PayPalButtons
          style={paypalButtonStyles}
          disabled={disabled || loading}
          createOrder={createOrder}
          onError={onButtonError}
          onCancel={onCancel}
          forceReRender={forceReRenderDeps}
        />
      </PayPalScriptProvider>
    </div>
  );
}
