import { validateEnvVars } from "./validators.ts";
import { ErrorCodes } from "./errors.ts";

// Mollie API base URL
const MOLLIE_API_URL = "https://api.mollie.com/v2";

/**
 * Make an authenticated request to Mollie API
 */
export async function mollieRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>
): Promise<T> {
  const apiKey = validateEnvVars.mollieApiKey();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${MOLLIE_API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.detail || data.title || JSON.stringify(data);
    console.error("Mollie API error:", data);
    throw ErrorCodes.MOLLIE_API_ERROR(errorMessage);
  }

  return data as T;
}

/**
 * Mollie Payment Status
 */
export type MolliePaymentStatusT =
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

/**
 * Mollie Payment Response
 */
export interface MolliePaymentResponseI {
  resource: "payment";
  id: string;
  mode: "test" | "live";
  createdAt: string;
  amount: {
    currency: string;
    value: string;
  };
  description: string;
  method: string | null;
  metadata: Record<string, unknown> | null;
  status: MolliePaymentStatusT;
  isCancelable: boolean;
  expiresAt: string;
  profileId: string;
  sequenceType: string;
  redirectUrl: string;
  webhookUrl: string;
  _links: {
    self: { href: string };
    checkout?: { href: string };
    dashboard: { href: string };
    documentation: { href: string };
  };
}

/**
 * Create Mollie Payment Parameters
 */
export interface CreateMolliePaymentParamsI {
  amount: number;
  currency?: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
  locale?: string;
}

/**
 * Create a Mollie payment
 * Returns the payment object with checkout URL
 */
export async function createMolliePayment(
  params: CreateMolliePaymentParamsI
): Promise<MolliePaymentResponseI> {
  const {
    amount,
    currency = "EUR",
    description,
    redirectUrl,
    webhookUrl,
    metadata,
    locale = "en_US",
  } = params;

  // Mollie requires amount as string with 2 decimal places
  const paymentPayload = {
    amount: {
      currency: currency.toUpperCase(),
      value: amount.toFixed(2),
    },
    description,
    redirectUrl,
    webhookUrl,
    metadata,
    locale,
  };

  return mollieRequest<MolliePaymentResponse>("/payments", "POST", paymentPayload);
}

/**
 * Get a Mollie payment by ID
 */
export async function getMolliePayment(paymentId: string): Promise<MolliePaymentResponseI> {
  if (!paymentId) {
    throw ErrorCodes.MOLLIE_PAYMENT_ID_REQUIRED();
  }

  return mollieRequest<MolliePaymentResponse>(`/payments/${paymentId}`, "GET");
}

/**
 * Check if a Mollie payment is successful
 */
export function isMolliePaymentPaid(status: MolliePaymentStatusT): boolean {
  return status === "paid";
}

/**
 * Check if a Mollie payment has failed
 */
export function isMolliePaymentFailed(status: MolliePaymentStatusT): boolean {
  return status === "failed" || status === "canceled" || status === "expired";
}

/**
 * Map Mollie status to our internal payment status
 */
export function mapMollieStatusToInternal(
  mollieStatus: MolliePaymentStatusT
): "processing" | "succeeded" | "failed" | "canceled" {
  switch (mollieStatus) {
    case "paid":
      return "succeeded";
    case "canceled":
      return "canceled";
    case "failed":
    case "expired":
      return "failed";
    case "open":
    case "pending":
    case "authorized":
    default:
      return "processing";
  }
}
