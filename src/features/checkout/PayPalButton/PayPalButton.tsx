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
    onApprove,
    onButtonError,
    onCancel,
    forceReRenderDeps,
    clearError,
  } = usePayPalButton({
    amount,
    lineItems,
    shippingAddress,
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
          onApprove={onApprove}
          onError={onButtonError}
          onCancel={onCancel}
          forceReRender={forceReRenderDeps}
        />
      </PayPalScriptProvider>
    </div>
  );
}
