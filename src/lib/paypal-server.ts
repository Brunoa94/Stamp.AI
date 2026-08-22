/**
 * Server-side PayPal utilities for Next.js API routes
 * This mirrors the functionality in supabase/functions/_shared/paypal.ts
 * for use in Next.js API routes.
 */

// PayPal API base URLs
const PAYPAL_API_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

/**
 * Custom error class for PayPal capture failures
 */
export class PayPalCaptureError extends Error {
  code: string;
  debugId?: string;
  isRetryable: boolean;

  constructor(message: string, code: string, debugId?: string, isRetryable = false) {
    super(message);
    this.name = "PayPalCaptureError";
    this.code = code;
    this.debugId = debugId;
    this.isRetryable = isRetryable;
  }
}

/**
 * Get PayPal client ID - runtime getter for testability
 */
function getPayPalClientId(): string {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    throw new Error("PAYPAL_CLIENT_ID environment variable is not set");
  }
  return clientId;
}

/**
 * Get PayPal client secret - runtime getter for testability
 */
function getPayPalClientSecret(): string {
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!secret) {
    throw new Error("PAYPAL_CLIENT_SECRET environment variable is not set");
  }
  return secret;
}

/**
 * Get the PayPal API base URL based on environment mode
 */
export function getPayPalApiBase(): string {
  const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
  return PAYPAL_API_URLS[mode];
}

/**
 * Get PayPal OAuth2 access token using client credentials
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = getPayPalClientId();
  const clientSecret = getPayPalClientSecret();
  const apiBase = getPayPalApiBase();

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

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
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Make an authenticated request to PayPal API
 */
async function paypalRequest<T = unknown>(
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
    throw new Error(`PayPal API error: ${errorMessage}`);
  }

  return data as T;
}

/**
 * Create PayPal order parameters
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
    region?: string;
    zip: string;
    country: string;
  };
  returnUrl: string;
  cancelUrl: string;
}

/**
 * PayPal order response
 */
export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * Create a PayPal order with redirect URLs
 */
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
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  return paypalRequest<PayPalOrderResponse>("/v2/checkout/orders", "POST", orderPayload);
}

/**
 * PayPal capture response
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

/**
 * Map PayPal error codes to user-friendly messages
 */
const PAYPAL_ERROR_MESSAGES: Record<string, { message: string; isRetryable: boolean }> = {
  INSTRUMENT_DECLINED: {
    message: "Your payment method was declined. Please try a different payment method.",
    isRetryable: true,
  },
  PAYER_ACTION_REQUIRED: {
    message: "Additional action is required. Please return to PayPal to complete the payment.",
    isRetryable: true,
  },
  ORDER_NOT_APPROVED: {
    message: "The payment was not approved. Please try again.",
    isRetryable: true,
  },
  ORDER_ALREADY_CAPTURED: {
    message: "This payment has already been processed.",
    isRetryable: false,
  },
  ORDER_COMPLETED: {
    message: "This order has already been completed.",
    isRetryable: false,
  },
  INTERNAL_SERVICE_ERROR: {
    message: "PayPal is temporarily unavailable. Please try again in a few minutes.",
    isRetryable: true,
  },
};

/**
 * Capture a PayPal order (complete the payment)
 * Includes enhanced error handling for declined payments
 */
export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const accessToken = await getPayPalAccessToken();
  const apiBase = getPayPalApiBase();

  const response = await fetch(`${apiBase}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Parse PayPal error response
    const errorCode = data.details?.[0]?.issue || data.name || "UNKNOWN_ERROR";
    const debugId = data.debug_id;
    // Unmapped codes get a generic friendly message — PayPal's own
    // `data.message` is technical and must not be shown to the user.
    const errorInfo = PAYPAL_ERROR_MESSAGES[errorCode] || {
      message: "Your payment could not be processed. Please try again or use a different payment method.",
      isRetryable: true,
    };

    console.error("PayPal capture error:", {
      code: errorCode,
      debugId,
      details: data.details,
      message: data.message,
    });

    throw new PayPalCaptureError(errorInfo.message, errorCode, debugId, errorInfo.isRetryable);
  }

  // Validate capture status
  if (data.status !== "COMPLETED") {
    const statusMessages: Record<string, { message: string; isRetryable: boolean }> = {
      PENDING: {
        message: "Payment is being processed. You will receive confirmation when it completes.",
        isRetryable: false,
      },
      DECLINED: {
        message: "The payment was declined. Please try a different payment method.",
        isRetryable: true,
      },
      FAILED: {
        message: "The payment could not be processed. Please try again.",
        isRetryable: true,
      },
    };

    const statusInfo = statusMessages[data.status] || {
      message:
        "We couldn't confirm your payment. Please contact support if you were charged.",
      isRetryable: false,
    };

    throw new PayPalCaptureError(statusInfo.message, data.status, undefined, statusInfo.isRetryable);
  }

  return data as PayPalCaptureResponse;
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(orderId: string): Promise<PayPalOrderResponse> {
  return paypalRequest<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}`, "GET");
}
