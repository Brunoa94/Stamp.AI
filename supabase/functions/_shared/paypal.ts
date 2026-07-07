import { validateEnvVars } from "./validators.ts";
import { ErrorCodes } from "./errors.ts";

// PayPal API base URLs
const PAYPAL_API_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

/**
 * Get the PayPal API base URL based on environment mode
 */
export function getPayPalApiBase(): string {
  const mode = validateEnvVars.paypalMode();
  return PAYPAL_API_URLS[mode];
}

/**
 * Get PayPal OAuth2 access token
 * Uses client credentials grant type
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = validateEnvVars.paypalClientId();
  const clientSecret = validateEnvVars.paypalClientSecret();
  const apiBase = getPayPalApiBase();

  const auth = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal token error:", errorText);
    throw ErrorCodes.PAYPAL_API_ERROR(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Make an authenticated request to PayPal API
 */
export async function paypalRequest<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>
): Promise<T> {
  const accessToken = await getPayPalAccessToken();
  const apiBase = getPayPalApiBase();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Add PayPal-Request-Id for idempotency on POST requests
  if (method === "POST" && body) {
    headers["PayPal-Request-Id"] = crypto.randomUUID();
  }

  const response = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || data.error_description || JSON.stringify(data);
    console.error("PayPal API error:", data);
    throw ErrorCodes.PAYPAL_API_ERROR(errorMessage);
  }

  return data as T;
}

/**
 * Create a PayPal order
 */
export interface CreatePayPalOrderParams {
  amount: number;
  currency?: string;
  description?: string;
  customId?: string;
  shippingAddress?: {
    firstName: string;
    lastName?: string;
    address1: string;
    address2?: string;
    city: string;
    region: string;
    zip: string;
    country: string;
  };
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export async function createPayPalOrder(params: CreatePayPalOrderParams): Promise<PayPalOrderResponse> {
  const {
    amount,
    currency = "USD",
    description,
    customId,
    shippingAddress,
    returnUrl,
    cancelUrl,
  } = params;

  const orderPayload: Record<string, unknown> = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2),
        },
        description: description || `Order ${Date.now()}`,
        custom_id: customId,
        ...(shippingAddress && {
          shipping: {
            name: {
              full_name: `${shippingAddress.firstName} ${shippingAddress.lastName || ""}`.trim(),
            },
            address: {
              address_line_1: shippingAddress.address1,
              address_line_2: shippingAddress.address2 || undefined,
              admin_area_2: shippingAddress.city,
              admin_area_1: shippingAddress.region,
              postal_code: shippingAddress.zip,
              country_code: shippingAddress.country,
            },
          },
        }),
      },
    ],
    application_context: {
      brand_name: "Imaginary Builder AI",
      shipping_preference: shippingAddress ? "SET_PROVIDED_ADDRESS" : "NO_SHIPPING",
      user_action: "PAY_NOW",
      ...(returnUrl && { return_url: returnUrl }),
      ...(cancelUrl && { cancel_url: cancelUrl }),
    },
  };

  return paypalRequest<PayPalOrderResponse>("/v2/checkout/orders", "POST", orderPayload);
}

/**
 * Capture a PayPal order (complete the payment)
 */
export interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer?: {
    payer_id: string;
    email_address: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
    custom_id?: string;
  }>;
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  return paypalRequest<PayPalCaptureResponse>(`/v2/checkout/orders/${orderId}/capture`, "POST");
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrderResponse> {
  return paypalRequest<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}`, "GET");
}

/**
 * Verify a PayPal webhook by asking PayPal to validate the transmission
 * signature against our configured webhook id. Returns true only when PayPal
 * responds with verification_status === "SUCCESS".
 *
 * Fails closed: any missing header, missing config, network error, or non-
 * SUCCESS response returns false so the caller must reject the event.
 */
export async function verifyPayPalWebhook(
  headers: Headers,
  body: string,
): Promise<boolean> {
  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");

  if (
    !transmissionId || !transmissionTime || !transmissionSig ||
    !certUrl || !authAlgo
  ) {
    console.warn("PayPal webhook rejected: missing transmission headers");
    return false;
  }

  // paypal-cert-url must be a genuine PayPal domain — reject anything the
  // caller could point at their own signing cert.
  try {
    const host = new URL(certUrl).hostname;
    if (host !== "api.paypal.com" && !host.endsWith(".paypal.com")) {
      console.warn("PayPal webhook rejected: untrusted cert url host", host);
      return false;
    }
  } catch {
    console.warn("PayPal webhook rejected: invalid cert url");
    return false;
  }

  let webhookId: string;
  try {
    webhookId = validateEnvVars.paypalWebhookId();
  } catch {
    console.error("PayPal webhook rejected: PAYPAL_WEBHOOK_ID not configured");
    return false;
  }

  // The webhook_event must be the parsed request body, byte-for-byte the same
  // payload PayPal signed.
  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(body);
  } catch {
    console.warn("PayPal webhook rejected: body is not valid JSON");
    return false;
  }

  try {
    const apiBase = getPayPalApiBase();
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${apiBase}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          transmission_sig: transmissionSig,
          cert_url: certUrl,
          auth_algo: authAlgo,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "PayPal webhook verification call failed:",
        response.status,
        response.statusText,
      );
      return false;
    }

    const result = await response.json();
    return result?.verification_status === "SUCCESS";
  } catch (error) {
    console.error("PayPal webhook verification error:", error);
    return false;
  }
}
