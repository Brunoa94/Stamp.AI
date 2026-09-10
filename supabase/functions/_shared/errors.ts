export interface ApiError {
  status: number;
  message: string;
}

export class FunctionError extends Error {
  public readonly status: number;
  public readonly errorId: string;

  constructor(status: number, errorId: string, message: string) {
    super(message);
    this.status = status;
    this.errorId = errorId;
    this.name = 'FunctionError';
  }
}

export const createErrorResponse = (error: ApiError, corsHeaders: Record<string, string>) => {
  return new Response(
    JSON.stringify({ error: error.message }),
    {
      status: error.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};

export const handleError = (error: unknown, corsHeaders: Record<string, string>) => {
  if (error instanceof FunctionError) {
    return createErrorResponse({ status: error.status, message: error.errorId }, corsHeaders);
  }

  if (error instanceof Error) {
    return createErrorResponse({ status: 500, message: 'INTERNAL_ERROR' }, corsHeaders);
  }

  return createErrorResponse({ status: 500, message: 'UNKNOWN_ERROR' }, corsHeaders);
};

// Common error definitions
export const ErrorCodes = {
  // Validation errors (400)
  BLUEPRINT_ID_REQUIRED: () => new FunctionError(400, 'BLUEPRINT_ID_REQUIRED', 'blueprint_id is required'),
  PRINT_PROVIDER_ID_REQUIRED: () => new FunctionError(400, 'PRINT_PROVIDER_ID_REQUIRED', 'print_provider_id is required'),
  IMAGE_REQUIRED: () => new FunctionError(400, 'IMAGE_REQUIRED', 'At least one print area image is required'),
  INVALID_REQUEST_BODY: () => new FunctionError(400, 'INVALID_REQUEST_BODY', 'Invalid request body'),
  INVALID_REQUEST: (message: string) => new FunctionError(400, 'INVALID_REQUEST', message),
  INVALID_COLOR: (message: string) => new FunctionError(400, 'INVALID_COLOR', message),

  // Environment errors (500)
  PRINTIFY_TOKEN_MISSING: () => new FunctionError(500, 'PRINTIFY_TOKEN_MISSING', 'Missing PRINTIFY_API_TOKEN'),
  PRINTIFY_SHOP_ID_MISSING: () => new FunctionError(500, 'PRINTIFY_SHOP_ID_MISSING', 'Missing PRINTIFY_SHOP_ID'),

  // External API errors (502)
  NO_VARIANTS_AVAILABLE: () => new FunctionError(502, 'NO_VARIANTS_AVAILABLE', 'No variants available for the specified blueprint and provider'),
  PRINTIFY_API_ERROR: (details: string) => new FunctionError(502, 'PRINTIFY_API_ERROR', `Printify API error: ${details}`),

  // Stripe errors
  STRIPE_SECRET_KEY_MISSING: () => new FunctionError(500, 'STRIPE_SECRET_KEY_MISSING', 'Missing STRIPE_SECRET_KEY'),
  AMOUNT_REQUIRED: () => new FunctionError(400, 'AMOUNT_REQUIRED', 'amount is required'),
  INVALID_AMOUNT: () => new FunctionError(400, 'INVALID_AMOUNT', 'amount must be a positive number'),
  STRIPE_API_ERROR: (details: string) => new FunctionError(502, 'STRIPE_API_ERROR', `Stripe API error: ${details}`),

  // Printify Order errors
  NO_PRODUCTS_IN_SHOP: () => new FunctionError(400, 'NO_PRODUCTS_IN_SHOP', 'No products available in your Printify shop. Please create a product first.'),
  NO_LINE_ITEMS: () => new FunctionError(400, 'NO_LINE_ITEMS', 'No line items provided for order'),
  MISSING_SHIPPING_ADDRESS: () => new FunctionError(400, 'MISSING_SHIPPING_ADDRESS', 'Shipping address is required'),
  PRINTIFY_ORDER_API_ERROR: (details: string) => new FunctionError(502, 'PRINTIFY_ORDER_API_ERROR', `Printify order API error: ${details}`),

  // Image upload errors
  IMAGE_URL_OR_BASE64_REQUIRED: () => new FunctionError(400, 'IMAGE_URL_OR_BASE64_REQUIRED', 'Either image_url or image_base64 is required'),
  IMAGE_UPLOAD_API_ERROR: (details: string) => new FunctionError(502, 'IMAGE_UPLOAD_API_ERROR', `Printify image upload API error: ${details}`),

  // Webhook errors
  STRIPE_WEBHOOK_SECRET_MISSING: () => new FunctionError(500, 'STRIPE_WEBHOOK_SECRET_MISSING', 'Missing STRIPE_WEBHOOK_SECRET'),
  WEBHOOK_SIGNATURE_MISSING: () => new FunctionError(400, 'WEBHOOK_SIGNATURE_MISSING', 'Missing Stripe signature header'),
  WEBHOOK_SIGNATURE_INVALID: (details: string) => new FunctionError(400, 'WEBHOOK_SIGNATURE_INVALID', `Invalid webhook signature: ${details}`),
  SUPABASE_URL_MISSING: () => new FunctionError(500, 'SUPABASE_URL_MISSING', 'Missing SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY_MISSING: () => new FunctionError(500, 'SUPABASE_SERVICE_ROLE_KEY_MISSING', 'Missing SUPABASE_SERVICE_ROLE_KEY'),

  // Authentication errors
  EMAIL_REQUIRED: () => new FunctionError(400, 'EMAIL_REQUIRED', 'email is required'),
  PASSWORD_REQUIRED: () => new FunctionError(400, 'PASSWORD_REQUIRED', 'password is required'),
  INVALID_EMAIL_FORMAT: () => new FunctionError(400, 'INVALID_EMAIL_FORMAT', 'Invalid email format'),
  PASSWORD_TOO_SHORT: () => new FunctionError(400, 'PASSWORD_TOO_SHORT', 'Password must be at least 8 characters long'),
  EMAIL_ALREADY_REGISTERED: () => new FunctionError(409, 'EMAIL_ALREADY_REGISTERED', 'Email is already registered'),
  AUTH_REGISTRATION_FAILED: (details: string) => new FunctionError(400, 'AUTH_REGISTRATION_FAILED', `Registration failed: ${details}`),
  INVALID_CREDENTIALS: () => new FunctionError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
  AUTH_LOGIN_FAILED: (details: string) => new FunctionError(401, 'AUTH_LOGIN_FAILED', `Login failed: ${details}`),
  EMAIL_NOT_CONFIRMED: () => new FunctionError(401, 'EMAIL_NOT_CONFIRMED', 'Email not confirmed. Please check your email and verify your account.'),
  INVALID_TOKEN: () => new FunctionError(401, 'INVALID_TOKEN', 'Invalid or expired token'),
  USER_NOT_FOUND: () => new FunctionError(404, 'USER_NOT_FOUND', 'User not found'),
  PASSWORD_RESET_FAILED: (details: string) => new FunctionError(400, 'PASSWORD_RESET_FAILED', `Password reset failed: ${details}`),

  // PayPal errors
  PAYPAL_CLIENT_ID_MISSING: () => new FunctionError(500, 'PAYPAL_CLIENT_ID_MISSING', 'Missing PAYPAL_CLIENT_ID'),
  PAYPAL_CLIENT_SECRET_MISSING: () => new FunctionError(500, 'PAYPAL_CLIENT_SECRET_MISSING', 'Missing PAYPAL_CLIENT_SECRET'),
  PAYPAL_WEBHOOK_ID_MISSING: () => new FunctionError(500, 'PAYPAL_WEBHOOK_ID_MISSING', 'Missing PAYPAL_WEBHOOK_ID'),
  PAYPAL_API_ERROR: (details: string) => new FunctionError(502, 'PAYPAL_API_ERROR', `PayPal API error: ${details}`),
  PAYPAL_ORDER_NOT_FOUND: () => new FunctionError(404, 'PAYPAL_ORDER_NOT_FOUND', 'PayPal order not found'),
  PAYPAL_CAPTURE_FAILED: (details: string) => new FunctionError(400, 'PAYPAL_CAPTURE_FAILED', `PayPal capture failed: ${details}`),
  PAYPAL_WEBHOOK_SIGNATURE_INVALID: (details: string) => new FunctionError(400, 'PAYPAL_WEBHOOK_SIGNATURE_INVALID', `Invalid PayPal webhook signature: ${details}`),
  PAYPAL_ORDER_ID_REQUIRED: () => new FunctionError(400, 'PAYPAL_ORDER_ID_REQUIRED', 'PayPal order ID is required'),

  // Mollie errors
  MOLLIE_API_KEY_MISSING: () => new FunctionError(500, 'MOLLIE_API_KEY_MISSING', 'Missing MOLLIE_API_KEY'),
  MOLLIE_API_ERROR: (details: string) => new FunctionError(502, 'MOLLIE_API_ERROR', `Mollie API error: ${details}`),
  MOLLIE_PAYMENT_NOT_FOUND: () => new FunctionError(404, 'MOLLIE_PAYMENT_NOT_FOUND', 'Mollie payment not found'),
  MOLLIE_PAYMENT_FAILED: (details: string) => new FunctionError(400, 'MOLLIE_PAYMENT_FAILED', `Mollie payment failed: ${details}`),
  MOLLIE_PAYMENT_ID_REQUIRED: () => new FunctionError(400, 'MOLLIE_PAYMENT_ID_REQUIRED', 'Mollie payment ID is required'),

  // Invoice errors
  ORDER_ID_REQUIRED: () => new FunctionError(400, 'ORDER_ID_REQUIRED', 'order_id is required'),
  INVOICE_ORDER_NOT_PAID: () => new FunctionError(400, 'INVOICE_ORDER_NOT_PAID', 'Invoices can only be generated for paid orders'),
  INVOICE_GENERATION_FAILED: (details: string) => new FunctionError(500, 'INVOICE_GENERATION_FAILED', `Invoice generation failed: ${details}`),

  // Authorization / resource errors
  UNAUTHORIZED: (details: string) => new FunctionError(403, 'UNAUTHORIZED', details),
  RESOURCE_NOT_FOUND: (details: string) => new FunctionError(404, 'RESOURCE_NOT_FOUND', details),

  // Generic errors
  INTERNAL_ERROR: () => new FunctionError(500, 'INTERNAL_ERROR', 'Internal server error'),
  UNKNOWN_ERROR: () => new FunctionError(500, 'UNKNOWN_ERROR', 'Unknown error occurred'),

    // Utility errors
    MISSING_REQUIRED_FIELDS: (details: string) => new FunctionError(400, 'MISSING_REQUIRED_FIELDS', `Missing required fields: ${details}`),
    DATABASE_ERROR: (details: string) => new FunctionError(500, 'DATABASE_ERROR', `Database error: ${details}`),
} as const;