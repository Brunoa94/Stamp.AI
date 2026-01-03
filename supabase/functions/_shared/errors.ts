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

  // Generic errors
  INTERNAL_ERROR: () => new FunctionError(500, 'INTERNAL_ERROR', 'Internal server error'),
  UNKNOWN_ERROR: () => new FunctionError(500, 'UNKNOWN_ERROR', 'Unknown error occurred'),
} as const;