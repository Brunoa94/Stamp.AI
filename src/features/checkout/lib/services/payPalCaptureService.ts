export interface PayPalCaptureResultI {
  ok: boolean;
  captureId?: string;
  payerEmail?: string;
  /** Vetted, user-friendly message returned by the capture API. */
  error?: string;
  code?: string;
  isRetryable?: boolean;
}

/** Capture an approved PayPal order through the app's capture API. */
export async function capturePayPalOrder(
  orderId: string,
  payerId: string,
): Promise<PayPalCaptureResultI> {
  const response = await fetch("/api/paypal/capture-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, payerId }),
  });
  const data = await response.json();

  return { ...data, ok: response.ok };
}

/** Declines the customer can fix by retrying with another method. */
export function isRetryablePayPalDecline(result: PayPalCaptureResultI) {
  return result.code === "INSTRUMENT_DECLINED" || Boolean(result.isRetryable);
}
